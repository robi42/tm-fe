// @flow
/* eslint-disable comma-dangle */
import { isEmpty, repeat } from 'ramda';
import {
  SET_CURRENT_PAGE,
  SET_PAGE_SIZE,
  SET_SEARCH_FILTER,
  SET_SORTED_BY,
  SET_SELECTED_IDS,
  SET_CALENDAR_HEATMAP_SCALE,
  SET_MULTI_ACTION_QUERY,
  FETCH_SCHEMA_SUCCESS,
  FETCH_ENTRIES_SUCCESS,
  FETCH_AGGS_SUCCESS,
  FETCH_AVG_AGG_SUCCESS,
  FETCH_MISSING_SUCCESS,
  FETCH_NORMALIZE_DATE_HISTOGRAM_SUCCESS,
  FETCH_DATE_HISTOGRAM_SUCCESS,
  UPLOAD_INPUT_CHANGE_SUCCESS,
  DELETE_ENTRIES_SUCCESS,
  SET_SELECTED_NORMALIZE_BAR,
  SET_OUTLIER_IDS,
  SET_OUTLIERS_FILTERED,
  SET_MERGE_FIELDS
} from './actions';
import { Record } from '../transit';
import { List, Map, Set } from 'immutable';
import { fromUtcDate } from '../lib/utils';
/* eslint-enable comma-dangle */

export const DEFAULT_PAGE_SIZE = 20;

export const KEY_FIRST_FIELD_OF_INTEREST = 'firstFieldOfInterest';
export const KEY_SECOND_FIELD_OF_INTEREST = 'secondFieldOfInterest';
export const KEY_NORMALIZE_DATE_HISTOGRAM_FIELD = 'normalizeDateHistogramField';
export const KEY_DATE_HISTOGRAM_FIELD = 'dateHistogramField';

export const SCALE_YEAR = 'year';
export const SCALE_MONTH = 'month';
export const SCALE_WEEK = 'week';
export const SCALE_DAY = 'day';
export const SCALE_HOUR = 'hour';

const KEY_LIST = 'list';

type State = {
  filter: string,
  sortedBy: string,
  selectedIds: Set<string>,
  outlierIds: Set<string>,
  outliersFiltered: boolean,
  schema: Map<string, string>,
  list: List<Object>,
  total: ?number,
  pageSize: number,
  currentPage: number,
  fields: List<string>,
  temporalFields: List<string>,
  firstFieldOfInterest: ?string,
  secondFieldOfInterest: ?string,
  aggs: Map<*, *>,
  missing: Map<*, *>,
  existingAvg: number,
  missingField: ?string,
  normalizeDateHistogram: List<Object>,
  normalizeDateHistogramField: ?string,
  normalizeDateHistogramInterval: 'year' | 'month',
  normalizeDateHistogramSelectedBar: ?number,
  dateHistogram: Map<*, *>,
  dateHistogramField: ?string,
  calendarHeatmapScale: 'year' | 'month' | 'week' | 'day',
  mergeSourceField: ?string,
  mergeTargetField: ?string,
  multiActionQuery: Object,
  uploadData: ?FormData,
  get: Function,
  set: Function,
};
const InitialState = Record({
  filter: '',
  sortedBy: '',
  selectedIds: Set(),
  outlierIds: Set(),
  outliersFiltered: false,
  schema: Map(),
  list: List(repeat({}, DEFAULT_PAGE_SIZE)),
  total: null,
  pageSize: DEFAULT_PAGE_SIZE,
  currentPage: 0,
  fields: List(),
  temporalFields: List(),
  firstFieldOfInterest: null,
  secondFieldOfInterest: null,
  aggs: Map(),
  missing: Map(),
  existingAvg: Date.now(),
  missingField: null,
  normalizeDateHistogram: List(),
  normalizeDateHistogramField: null,
  normalizeDateHistogramInterval: SCALE_MONTH,
  normalizeDateHistogramSelectedBar: null,
  dateHistogram: List(),
  dateHistogramField: null,
  calendarHeatmapScale: SCALE_MONTH,
  mergeSourceField: null,
  mergeTargetField: null,
  multiActionQuery: { field: '', value: '' },
  uploadData: null,
}, 'entries');

const getFields = (searchHits: Object): string[] => Object.keys(searchHits[0]._source);

const getHits = (searchHits: Object): Object => searchHits.map(it => {
  const transformedFields = it.fields;

  if (transformedFields && !isEmpty(transformedFields)) {
    Object.entries(transformedFields).forEach(entry => {
      const field = entry[0];
      const values: any = entry[1];
      const value = values[0];

      if (value !== 0) {
        it._source[field] = value;
      }
    });
  }

  return {
    _id: it._id,
    _timestamp: it._timestamp,
    ...it._source,
  };
});

const getDateHistogramField = (temporalFields: string[],
                               currentDateHistogramField: ?string): ?string => {
  if (isEmpty(temporalFields)) {
    return null;
  }
  if (currentDateHistogramField != null && temporalFields.includes(currentDateHistogramField)) {
    return currentDateHistogramField;
  }
  return temporalFields[0];
};

const getDateHistogramKey = (keyEpochMillis: number): number => (
  fromUtcDate(keyEpochMillis).getTime() / 1000
);

const getDateHistogram = (aggs: Object): Map<string, number> => {
  const dateHistogram = {};
  aggs.date_histogram.buckets.forEach(it => {
    dateHistogram[getDateHistogramKey(it.key)] = it.doc_count;
  });
  return Map(dateHistogram);
};

const getFieldOfInterestValue = (aggs: Object, fieldName: string, bucketIndex: number): string => (
  aggs[fieldName].buckets[bucketIndex].key
);

const getFieldOfInterestCount = (aggs: Object, fieldName: string, bucketIndex: number): number => (
  aggs[fieldName].buckets[bucketIndex].doc_count
);

const isDateHistogramField = (fieldName: string): boolean => fieldName === KEY_DATE_HISTOGRAM_FIELD;

const entriesReducer = (state: State = new InitialState(), action: Action): State => {
  switch (action.type) {
    case SET_CURRENT_PAGE: {
      const { payload: { value } } = action;
      return state.set('currentPage', value);
    }

    case SET_PAGE_SIZE: {
      const { payload: { value } } = action;
      return state.set('pageSize', value);
    }

    case SET_SEARCH_FILTER: {
      const { payload: { value } } = action;
      return state.set('filter', value);
    }

    case SET_SORTED_BY: {
      const { payload: { value } } = action;
      return state.set('sortedBy', value);
    }

    case SET_SELECTED_IDS: {
      const { payload: { ids } } = action;
      return state.set('selectedIds', Set(ids));
    }

    case SET_OUTLIER_IDS: {
      const { payload: { ids } } = action;
      return state.set('outlierIds', Set(ids));
    }

    case SET_OUTLIERS_FILTERED: {
      const { payload: { filtered } } = action;
      return state.set('outliersFiltered', filtered);
    }

    case SET_CALENDAR_HEATMAP_SCALE: {
      const { payload: { scale } } = action;
      return state.set('calendarHeatmapScale', scale);
    }

    case SET_MERGE_FIELDS: {
      const { payload: { sourceField, targetField } } = action;
      return state
        .set('mergeSourceField', sourceField)
        .set('mergeTargetField', targetField);
    }

    case SET_MULTI_ACTION_QUERY: {
      const { payload: { fieldName, bucketIndex, date, count, scale } } = action;
      const aggs = state.aggs.toJS();
      const isDateHistogram = isDateHistogramField(fieldName);
      const fieldOfInterestValue = isDateHistogram ?
        date.toISOString() : getFieldOfInterestValue(aggs, fieldName, bucketIndex);
      const fieldOfInterestCount = isDateHistogram ?
        count : getFieldOfInterestCount(aggs, fieldName, bucketIndex);
      const field = state.get(fieldName);
      const isTemporal = state.temporalFields.contains(field);
      const query = {
        field,
        isTemporal,
        scale: isTemporal && !scale ? SCALE_DAY : scale,
        value: isTemporal ? new Date(fieldOfInterestValue).toISOString() : fieldOfInterestValue,
        count: fieldOfInterestCount,
      };
      return state.set('multiActionQuery', query);
    }

    case SET_SELECTED_NORMALIZE_BAR: {
      const { payload: { value } } = action;
      return state.set('normalizeDateHistogramSelectedBar', value);
    }

    case FETCH_SCHEMA_SUCCESS: {
      const { payload } = action;
      const schema = {};
      Object.keys(payload).forEach(key => {
        schema[key] = payload[key].type;
      });

      const temporalFields = [];
      const fields = Object.entries(schema);
      fields.forEach(entry => {
        const value = entry[1];
        if (value === 'date') {
          const field = entry[0];
          temporalFields.push(field);
        }
      });

      const dateHistogramField = getDateHistogramField(temporalFields, state.dateHistogramField);
      state = state
        .set(KEY_NORMALIZE_DATE_HISTOGRAM_FIELD, dateHistogramField)
        .set(KEY_DATE_HISTOGRAM_FIELD, dateHistogramField);

      if (state.firstFieldOfInterest == null) {
        const firstFieldName = fields[0][0];
        state = state
          .set(KEY_FIRST_FIELD_OF_INTEREST, firstFieldName)
          .set(KEY_SECOND_FIELD_OF_INTEREST, firstFieldName);
      }

      return state
        .set('schema', Map(schema))
        .set('fields', List(fields.map(it => it[0])))
        .set('temporalFields', List(temporalFields));
    }

    case FETCH_ENTRIES_SUCCESS: {
      const {
        payload: {
          hits: { hits: searchHits, total },
        },
      } = action;
      const isSearchHitsEmpty = isEmpty(searchHits);
      const hits = isSearchHitsEmpty ? [] : getHits(searchHits);
      const newState = state
        .set(KEY_LIST, List(hits))
        .set('total', total);

      if (!isSearchHitsEmpty && state.firstFieldOfInterest == null) {
        const fields = getFields(searchHits);
        const firstField = fields[0];
        return newState
          .set(KEY_FIRST_FIELD_OF_INTEREST, firstField)
          .set(KEY_SECOND_FIELD_OF_INTEREST, firstField);
      }
      return newState;
    }

    case FETCH_AGGS_SUCCESS: {
      const {
        payload: {
          aggregations,
          firstFieldOfInterest,
          secondFieldOfInterest,
        },
      } = action;
      return state
        .set('aggs', Map(aggregations))
        .set(KEY_FIRST_FIELD_OF_INTEREST, firstFieldOfInterest)
        .set(KEY_SECOND_FIELD_OF_INTEREST, secondFieldOfInterest);
    }

    case FETCH_AVG_AGG_SUCCESS: {
      const { payload: { aggregations: { existing: { avg: { value } } } } } = action;
      return state.set('existingAvg', Math.round(value));
    }

    case FETCH_MISSING_SUCCESS: {
      const {
        payload: {
          aggregations,
          fieldOfInterest,
        },
      } = action;
      return state
        .set('missing', Map(aggregations.missing))
        .set('missingField', fieldOfInterest);
    }

    case FETCH_NORMALIZE_DATE_HISTOGRAM_SUCCESS: {
      const { payload: { aggregations: { date_histogram }, fieldOfInterest, interval } } = action;
      return state
        .set('normalizeDateHistogram', List(date_histogram.buckets).take(10).toList())
        .set(KEY_NORMALIZE_DATE_HISTOGRAM_FIELD, fieldOfInterest)
        .set('normalizeDateHistogramInterval', interval);
    }

    case FETCH_DATE_HISTOGRAM_SUCCESS: {
      const { payload: { aggregations, fieldOfInterest } } = action;
      return state
        .set('dateHistogram', getDateHistogram(aggregations))
        .set(KEY_DATE_HISTOGRAM_FIELD, fieldOfInterest);
    }

    case UPLOAD_INPUT_CHANGE_SUCCESS:
      return state
        .set('uploadData', action.payload)
        .set(KEY_FIRST_FIELD_OF_INTEREST, null)
        .set(KEY_SECOND_FIELD_OF_INTEREST, null);

    case DELETE_ENTRIES_SUCCESS: {
      let { list } = state;
      action.payload.forEach(id => {
        list = list.delete(list.findIndex(it => it._id === id));
      });
      return state.set(KEY_LIST, list);
    }

    default:
      return state;
  }
};

export default entriesReducer;
