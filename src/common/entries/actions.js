// @flow
import { isEmpty } from 'ramda';
import { Map, Set } from 'immutable';
import { HttpMethod, HttpHeader, MediaType } from '../../common/lib/utils';
import { DEFAULT_PAGE_SIZE, SCALE_HOUR, SCALE_MONTH } from './reducer';

export const SET_CURRENT_PAGE = 'SET_CURRENT_PAGE';
export const SET_PAGE_SIZE = 'SET_PAGE_SIZE';
export const SET_SEARCH_FILTER = 'SET_SEARCH_FILTER';
export const SET_SORTED_BY = 'SET_SORTED_BY';
export const SET_SELECTED_IDS = 'SET_SELECTED_IDS';
export const SET_OUTLIER_IDS = 'SET_OUTLIER_IDS';
export const SET_OUTLIERS_FILTERED = 'SET_OUTLIERS_FILTERED';
export const SET_MERGE_FIELDS = 'SET_MERGE_FIELDS';
export const SET_MULTI_ACTION_QUERY = 'SET_MULTI_ACTION_QUERY';
export const SET_CALENDAR_HEATMAP_SCALE = 'SET_CALENDAR_HEATMAP_SCALE';
export const SET_SELECTED_NORMALIZE_BAR = 'SET_SELECTED_NORMALIZE_BAR';

export const FETCH_SCHEMA = 'FETCH_SCHEMA';
export const FETCH_SCHEMA_START = `${FETCH_SCHEMA}_START`;
export const FETCH_SCHEMA_ERROR = `${FETCH_SCHEMA}_ERROR`;
export const FETCH_SCHEMA_SUCCESS = `${FETCH_SCHEMA}_SUCCESS`;

export const FETCH_ENTRIES = 'FETCH_ENTRIES';
export const FETCH_ENTRIES_START = `${FETCH_ENTRIES}_START`;
export const FETCH_ENTRIES_ERROR = `${FETCH_ENTRIES}_ERROR`;
export const FETCH_ENTRIES_SUCCESS = `${FETCH_ENTRIES}_SUCCESS`;

export const FETCH_AGGS = 'FETCH_AGGS';
export const FETCH_AGGS_START = `${FETCH_AGGS}_START`;
export const FETCH_AGGS_ERROR = `${FETCH_AGGS}_ERROR`;
export const FETCH_AGGS_SUCCESS = `${FETCH_AGGS}_SUCCESS`;

export const FETCH_AVG_AGG = 'FETCH_AVG_AGG';
export const FETCH_AVG_AGG_START = `${FETCH_AVG_AGG}_START`;
export const FETCH_AVG_AGG_ERROR = `${FETCH_AVG_AGG}_ERROR`;
export const FETCH_AVG_AGG_SUCCESS = `${FETCH_AVG_AGG}_SUCCESS`;

export const FETCH_MISSING = 'FETCH_MISSING';
export const FETCH_MISSING_START = `${FETCH_MISSING}_START`;
export const FETCH_MISSING_ERROR = `${FETCH_MISSING}_ERROR`;
export const FETCH_MISSING_SUCCESS = `${FETCH_MISSING}_SUCCESS`;

export const FETCH_NORMALIZE_DATE_HISTOGRAM = 'FETCH_NORMALIZE_DATE_HISTOGRAM';
export const FETCH_NORMALIZE_DATE_HISTOGRAM_START = `${FETCH_NORMALIZE_DATE_HISTOGRAM}_START`;
export const FETCH_NORMALIZE_DATE_HISTOGRAM_ERROR = `${FETCH_NORMALIZE_DATE_HISTOGRAM}_ERROR`;
export const FETCH_NORMALIZE_DATE_HISTOGRAM_SUCCESS = `${FETCH_NORMALIZE_DATE_HISTOGRAM}_SUCCESS`;

export const FETCH_DATE_HISTOGRAM = 'FETCH_DATE_HISTOGRAM';
export const FETCH_DATE_HISTOGRAM_START = `${FETCH_DATE_HISTOGRAM}_START`;
export const FETCH_DATE_HISTOGRAM_ERROR = `${FETCH_DATE_HISTOGRAM}_ERROR`;
export const FETCH_DATE_HISTOGRAM_SUCCESS = `${FETCH_DATE_HISTOGRAM}_SUCCESS`;

export const UPLOAD_CSV = 'UPLOAD_CSV';
export const UPLOAD_CSV_START = `${UPLOAD_CSV}_START`;
export const UPLOAD_CSV_ERROR = `${UPLOAD_CSV}_ERROR`;
export const UPLOAD_CSV_SUCCESS = `${UPLOAD_CSV}_SUCCESS`;

export const UPLOAD_INPUT_CHANGE = 'UPLOAD_INPUT_CHANGE';
export const UPLOAD_INPUT_CHANGE_START = `${UPLOAD_INPUT_CHANGE}_START`;
export const UPLOAD_INPUT_CHANGE_ERROR = `${UPLOAD_INPUT_CHANGE}_ERROR`;
export const UPLOAD_INPUT_CHANGE_SUCCESS = `${UPLOAD_INPUT_CHANGE}_SUCCESS`;

export const POST_MERGE = 'POST_MERGE';
export const POST_MERGE_START = `${POST_MERGE}_START`;
export const POST_MERGE_ERROR = `${POST_MERGE}_ERROR`;
export const POST_MERGE_SUCCESS = `${POST_MERGE}_SUCCESS`;

export const UPDATE_ENTRY = 'UPDATE_ENTRY';
export const UPDATE_ENTRY_START = `${UPDATE_ENTRY}_START`;
export const UPDATE_ENTRY_ERROR = `${UPDATE_ENTRY}_ERROR`;
export const UPDATE_ENTRY_SUCCESS = `${UPDATE_ENTRY}_SUCCESS`;

export const TRANSFORM_MISSING = 'TRANSFORM_MISSING';
export const TRANSFORM_MISSING_START = `${TRANSFORM_MISSING}_START`;
export const TRANSFORM_MISSING_ERROR = `${TRANSFORM_MISSING}_ERROR`;
export const TRANSFORM_MISSING_SUCCESS = `${TRANSFORM_MISSING}_SUCCESS`;

export const TRANSFORM_ENTRIES = 'TRANSFORM_ENTRIES';
export const TRANSFORM_ENTRIES_START = `${TRANSFORM_ENTRIES}_START`;
export const TRANSFORM_ENTRIES_ERROR = `${TRANSFORM_ENTRIES}_ERROR`;
export const TRANSFORM_ENTRIES_SUCCESS = `${TRANSFORM_ENTRIES}_SUCCESS`;

export const DELETE_ENTRIES = 'DELETE_ENTRIES';
export const DELETE_ENTRIES_START = `${DELETE_ENTRIES}_START`;
export const DELETE_ENTRIES_ERROR = `${DELETE_ENTRIES}_ERROR`;
export const DELETE_ENTRIES_SUCCESS = `${DELETE_ENTRIES}_SUCCESS`;

export const DELETE_ENTRIES_BY_FIELD_VALUE = 'DELETE_ENTRIES_BY_FIELD_VALUE';
export const DELETE_ENTRIES_BY_FIELD_VALUE_START = `${DELETE_ENTRIES_BY_FIELD_VALUE}_START`;
export const DELETE_ENTRIES_BY_FIELD_VALUE_ERROR = `${DELETE_ENTRIES_BY_FIELD_VALUE}_ERROR`;
export const DELETE_ENTRIES_BY_FIELD_VALUE_SUCCESS = `${DELETE_ENTRIES_BY_FIELD_VALUE}_SUCCESS`;

export const DELETE_MISSING = 'DELETE_MISSING';
export const DELETE_MISSING_START = `${DELETE_MISSING}_START`;
export const DELETE_MISSING_ERROR = `${DELETE_MISSING}_ERROR`;
export const DELETE_MISSING_SUCCESS = `${DELETE_MISSING}_SUCCESS`;

const { POST, PUT, DELETE } = HttpMethod;
const { CONTENT_TYPE } = HttpHeader;
const { APPLICATION_JSON } = MediaType;
const INCLUDE = 'include';
const NO_FILTER = '';
const NO_SORTED_BY = '';

export const FIRST_PAGE = 0;
export const DEFAULT_NORMALIZE_DATE_HISTOGRAM_INTERVAL = SCALE_MONTH;
export const DEFAULT_DATE_HISTOGRAM_INTERVAL = SCALE_HOUR;

export function setCurrentPage(value: string): Action {
  return { type: SET_CURRENT_PAGE, payload: { value } };
}

export function setPageSize(value: string): Action {
  return { type: SET_PAGE_SIZE, payload: { value } };
}

export function setSearchFilter(value: string): Action {
  return { type: SET_SEARCH_FILTER, payload: { value } };
}

export function setSortedBy(value: string): Action {
  return { type: SET_SORTED_BY, payload: { value } };
}

export function setSelectedIds(ids: string[]): Action {
  return { type: SET_SELECTED_IDS, payload: { ids } };
}

export function setOutlierIds(ids: string[]): Action {
  return { type: SET_OUTLIER_IDS, payload: { ids } };
}

export function setOutliersFiltered(filtered: boolean): Action {
  return { type: SET_OUTLIERS_FILTERED, payload: { filtered } };
}

export function setMergeFields(fields: Object): Action {
  return { type: SET_MERGE_FIELDS, payload: fields };
}

export function setMultiActionQuery(query: Object): Action {
  return { type: SET_MULTI_ACTION_QUERY, payload: query };
}

export function setCalendarHeatmapScale(scale: string): Action {
  return { type: SET_CALENDAR_HEATMAP_SCALE, payload: { scale } };
}

export function setSelectedNormalizeBar(value: ?number): Action {
  return { type: SET_SELECTED_NORMALIZE_BAR, payload: { value } };
}

async function fetchSchemaAsync(fetch: Function): Promise<JSON> {
  const response = await fetch('/temporal-entries', { credentials: INCLUDE });
  return response.json();
}

export function fetchSchema(): Function {
  return ({ fetch }: Function) => ({
    type: FETCH_SCHEMA,
    payload: {
      promise: fetchSchemaAsync(fetch),
    },
  });
}

const createIdQueryParams = (ids: string[]) => {
  if (isEmpty(ids)) {
    return '';
  }

  let idQueryParams = `id=${ids[0]}`;
  if (ids.length > 1) {
    ids.slice(1).forEach(id => { idQueryParams += `&id=${id}`; });
  }
  return idQueryParams;
};

const getScriptFields = (schema: Map<string, string>): string[] => {
  const scriptFields = [];

  if (!schema.isEmpty()) {
    const dateFields = schema.filter(value => value === 'date');

    dateFields.entrySeq().forEach(entry => {
      const dateField = entry[0];
      scriptFields.push(dateField);
    });
  }

  return scriptFields;
};

async function fetchEntriesAsync(fetch: Function, /* eslint-disable */
                                 page: number = FIRST_PAGE,
                                 pageSize: number = DEFAULT_PAGE_SIZE,
                                 schema: Map<string, string> = Map(),
                                 filter: string = '',
                                 sortedBy: string = '',
                                 ids: Set<string> = Set()): Promise<JSON> { /* eslint-enable */
  const idQueryParams = isEmpty(ids) ? '' : `&${createIdQueryParams(ids.toJS())}`;
  const scriptFields = getScriptFields(schema);
  const from = page > FIRST_PAGE ? page * pageSize : FIRST_PAGE;
  const path = `/temporal-entries/search?from=${from}&size=${pageSize}&sort=${sortedBy}${idQueryParams}`;
  const response = await fetch(path, {
    method: POST,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify({ query: filter, aggs: {}, scriptFields }),
  });
  return response.json();
}

export function fetchEntries(schema: Map<string, string>, ids: Set<string>): Function {
  return ({ fetch }: any) => ({
    type: FETCH_ENTRIES,
    payload: {
      promise: fetchEntriesAsync(
        fetch,
        FIRST_PAGE,
        DEFAULT_PAGE_SIZE,
        schema,
        NO_FILTER,
        NO_SORTED_BY,
        ids,
      ),
    },
  });
}

export function fetchEntriesPaged(page: number, /* eslint-disable */
                                  pageSize: number,
                                  schema: Map<string, string>,
                                  filter: string = '',
                                  sortedBy: string = '',
                                  ids: Set<string>): Function { /* eslint-enable */
  return ({ fetch }: any) => ({
    type: FETCH_ENTRIES,
    payload: {
      promise: fetchEntriesAsync(fetch, page, pageSize, schema, filter, sortedBy, ids),
    },
  });
}

async function fetchAggsAsync(fetch: Function, /* eslint-disable */
                              firstFieldOfInterest: string,
                              secondFieldOfInterest: string,
                              filter: string = '',
                              ids: Set<string> = Set()): Promise<JSON> { /* eslint-enable */
  const idQueryParams = isEmpty(ids) ? '' : `&${createIdQueryParams(ids.toJS())}`;
  const response = await fetch(`/temporal-entries/search?size=0${idQueryParams}`, {
    method: POST,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify({
      query: filter,
      aggs: {
        firstFieldOfInterest: { terms: { field: firstFieldOfInterest, size: 5 } },
        secondFieldOfInterest: { terms: { field: secondFieldOfInterest, size: 5 } },
      },
    }),
  });
  const json = await response.json();
  json.firstFieldOfInterest = firstFieldOfInterest;
  json.secondFieldOfInterest = secondFieldOfInterest;
  return json;
}

export function fetchAggs(firstFieldOfInterest: string, /* eslint-disable */
                          secondFieldOfInterest: string,
                          filter: string,
                          ids: Set<string>): Function { /* eslint-enable */
  return ({ fetch }: any) => ({
    type: FETCH_AGGS,
    payload: {
      promise: fetchAggsAsync(fetch, firstFieldOfInterest, secondFieldOfInterest, filter, ids),
    },
  });
}

async function fetchAvgAggAsync(fetch: Function, fieldOfInterest: string): Promise<JSON> {
  const response = await fetch('/temporal-entries/search?size=0', {
    method: POST,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify({
      aggs: {
        existing: {
          filter: { bool: { must: { exists: { field: fieldOfInterest } } } },
          aggs: { avg: { avg: { script: { inline: `doc['${fieldOfInterest}'].date.getMillis()` } } } },
        },
      },
    }),
  });
  return response.json();
}

export function fetchAvgAgg(fieldOfInterest: string): Function {
  return ({ fetch }: any) => ({
    type: FETCH_AVG_AGG,
    payload: {
      promise: fetchAvgAggAsync(fetch, fieldOfInterest),
    },
  });
}

async function fetchMissingAsync(fetch: Function, fieldOfInterest: string): Promise<JSON> {
  const response = await fetch('/temporal-entries/search?size=0', {
    method: POST,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify({
      aggs: {
        missing: {
          missing: { field: fieldOfInterest },
          aggs: { top_hits: { top_hits: { _source: { include: [fieldOfInterest] } } } },
        },
      },
    }),
  });
  const json = await response.json();
  json.fieldOfInterest = fieldOfInterest;
  return json;
}

export function fetchMissing(firstFieldOfInterest: string): Function {
  return ({ fetch }: any) => ({
    type: FETCH_MISSING,
    payload: {
      promise: fetchMissingAsync(fetch, firstFieldOfInterest),
    },
  });
}

async function fetchNormalizeDateHistogramAsync(fetch: Function, /* eslint-disable */
                                                fieldOfInterest: string,
                                                interval: string = DEFAULT_NORMALIZE_DATE_HISTOGRAM_INTERVAL): Promise<JSON> { /* eslint-enable */
  const response = await fetch('/temporal-entries/search?size=0', {
    method: POST,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify({
      aggs: {
        date_histogram: {
          date_histogram: { field: fieldOfInterest, interval, order: { _count: 'desc' } },
        },
      },
    }),
  });
  const json = await response.json();
  json.fieldOfInterest = fieldOfInterest;
  json.interval = interval;
  return json;
}

export function fetchNormalizeDateHistogram(fieldOfInterest: string, interval: string): Function {
  return ({ fetch }: any) => ({
    type: FETCH_NORMALIZE_DATE_HISTOGRAM,
    payload: {
      promise: fetchNormalizeDateHistogramAsync(fetch, fieldOfInterest, interval),
    },
  });
}

async function fetchDateHistogramAsync(fetch: Function, /* eslint-disable */
                                       fieldOfInterest: string,
                                       interval: string = DEFAULT_DATE_HISTOGRAM_INTERVAL,
                                       filter: string = '',
                                       ids: Set<string> = Set()): Promise<JSON> { /* eslint-enable */
  const idQueryParams = isEmpty(ids) ? '' : `&${createIdQueryParams(ids.toJS())}`;
  const response = await fetch(`/temporal-entries/search?size=0${idQueryParams}`, {
    method: POST,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify({
      query: filter,
      aggs: {
        date_histogram: { date_histogram: { field: fieldOfInterest, interval } },
      },
    }),
  });
  const json = await response.json();
  json.fieldOfInterest = fieldOfInterest;
  return json;
}

export function fetchDateHistogram(fieldOfInterest: string, /* eslint-disable */
                                   interval: string,
                                   filter: string,
                                   ids: Set<string>): Function { /* eslint-enable */
  return ({ fetch }: any) => ({
    type: FETCH_DATE_HISTOGRAM,
    payload: {
      promise: fetchDateHistogramAsync(fetch, fieldOfInterest, interval, filter, ids),
    },
  });
}

async function uploadCsvAsync(fetch: Function, data: FormData): Promise<Object> {
  const response = await fetch('/temporal-entries', {
    method: POST,
    credentials: INCLUDE,
    body: data,
  });
  return { responseOk: response.ok };
}

export function uploadCsv(data: FormData): Function {
  return ({ fetch }: any) => ({
    type: UPLOAD_CSV,
    payload: {
      promise: uploadCsvAsync(fetch, data),
    },
  });
}

const TABULATOR = '\t';

function getCsvSeparator(header: string): string {
  let separator = TABULATOR;

  [TABULATOR, ';', ','].forEach(candidate => {
    if (header.split(candidate).length > 1) {
      separator = candidate;
    }
  });

  return separator;
}

const fileReader = process.env.IS_BROWSER ? new FileReader() : null; // eslint-disable-line no-undef

async function getCsvSeparatorAsync(file: File): Promise<string> {
  if (fileReader == null) {
    return Promise.resolve(TABULATOR);
  }

  fileReader.readAsText(file);

  return new Promise(resolve => {
    fileReader.onload = event => {
      const text = event.target.result;
      const header = text.split('\n')[0];

      resolve(getCsvSeparator(header));
    };
  });
}

async function updateEntryAsync(fetch: Function, id: string, dto: Object): Promise<JSON> {
  const response = await fetch(`/temporal-entries/${id}`, {
    method: PUT,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify(dto),
  });
  return response.json();
}

export function updateEntry(id: string, dto: Object): Function {
  return ({ fetch }: any) => ({
    type: UPDATE_ENTRY,
    payload: {
      promise: updateEntryAsync(fetch, id, dto),
    },
  });
}

async function transformMissingEntriesAsync(fetch: Function, /* eslint-disable */
                                            field: string,
                                            timestamp: number): Promise<Object> { /* eslint-enable */
  const uriEncodedField = encodeURIComponent(field);
  await fetch(`/temporal-entries/missing?field=${uriEncodedField}`, {
    method: PUT,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify({ to: timestamp }),
  });
  return Promise.resolve({ ok: true });
}

export function transformMissingEntries(field: string, timestamp: number): Function {
  return ({ fetch }: any) => ({
    type: TRANSFORM_MISSING,
    payload: {
      promise: transformMissingEntriesAsync(fetch, field, timestamp),
    },
  });
}

function getToDto(toBeTimestamp: number, toBeWithYear: number, toBeWithMonth: number): Object {
  if (toBeTimestamp > 0 || toBeTimestamp < 0) {
    return { toTimestamp: toBeTimestamp };
  }
  if (toBeWithMonth > 0) {
    return { toYearMonth: [toBeWithYear, toBeWithMonth] };
  }
  return { toYear: toBeWithYear };
}

async function transformEntriesAsync(fetch: Function, /* eslint-disable */
                                     field: string,
                                     queryIsoDateTime: string,
                                     scale: string,
                                     toBeTimestamp: number,
                                     toBeWithYear: number,
                                     toBeWithMonth: number): Promise<Object> { /* eslint-enable */
  const uriEncodedField = encodeURIComponent(field);
  const path =
    `/temporal-entries/?field=${uriEncodedField}&value=${queryIsoDateTime}&scale=${scale.toUpperCase()}`; // eslint-disable-line max-len
  await fetch(path, {
    method: PUT,
    credentials: INCLUDE,
    headers: { [CONTENT_TYPE]: APPLICATION_JSON, Accept: APPLICATION_JSON },
    body: JSON.stringify(getToDto(toBeTimestamp, toBeWithYear, toBeWithMonth)),
  });
  return Promise.resolve({ ok: true });
}

export function transformEntries(field: string, /* eslint-disable */
                                 queryIsoDateTime: string,
                                 scale: string,
                                 toBeTimestamp: number,
                                 toBeWithYear: number,
                                 toBeWithMonth: number): Function { /* eslint-enable */
  return ({ fetch }: any) => ({
    type: TRANSFORM_ENTRIES,
    payload: {
      promise: transformEntriesAsync(
        fetch,
        field,
        queryIsoDateTime,
        scale,
        toBeTimestamp,
        toBeWithYear,
        toBeWithMonth,
      ),
    },
  });
}

async function postMergeAsync(fetch: Function, /* eslint-disable */
                              sourceField: string,
                              targetField: string): Promise<Object> { /* eslint-enable */
  await fetch(`/temporal-entries/merge?sourceField=${sourceField}&targetField=${targetField}`, {
    method: POST,
    credentials: INCLUDE,
  });
  return Promise.resolve({ ok: true });
}

export function postMerge(sourceField: string, targetField: string): Function {
  return ({ fetch }: Function) => ({
    type: POST_MERGE,
    payload: {
      promise: postMergeAsync(fetch, sourceField, targetField),
    },
  });
}

async function deleteEntriesAsync(fetch: Function, ids: string[]): Promise<string[]> {
  const idQueryParams = createIdQueryParams(ids);
  await fetch(`/temporal-entries/?${idQueryParams}`, {
    method: DELETE,
    credentials: INCLUDE,
  });
  return Promise.resolve(ids);
}

export function deleteEntries(ids: string[]): Function {
  return ({ fetch }: any) => ({
    type: DELETE_ENTRIES,
    payload: {
      promise: deleteEntriesAsync(fetch, ids),
    },
  });
}

async function deleteEntriesByFieldValueAsync(fetch: Function, /* eslint-disable */
                                              field: string,
                                              value: string,
                                              scale: string,
                                              filter: string = '',
                                              ids: Set<string> = Set()): Promise<Object> { /* eslint-enable */
  const uriEncodedField = encodeURIComponent(field);
  const uriEncodedValue = encodeURIComponent(value);
  const scaleParam = scale ? `&scale=${scale.toUpperCase()}` : '';
  const idQueryParams = isEmpty(ids) ? '' : `&${createIdQueryParams(ids.toJS())}`;
  const path =
    `/temporal-entries/query?field=${uriEncodedField}&value=${uriEncodedValue}${scaleParam}&filter=${filter}${idQueryParams}`; // eslint-disable-line max-len
  await fetch(path, { method: DELETE, credentials: INCLUDE });
  return Promise.resolve({ ok: true });
}

export function deleteEntriesByFieldValue(field: string, /* eslint-disable */
                                          value: string,
                                          scale: string,
                                          filter: string,
                                          ids: Set<string>): Function { /* eslint-enable */
  return ({ fetch }: any) => ({
    type: DELETE_ENTRIES_BY_FIELD_VALUE,
    payload: {
      promise: deleteEntriesByFieldValueAsync(fetch, field, value, scale, filter, ids),
    },
  });
}

async function deleteMissingEntriesAsync(fetch: Function, field: string): Promise<Object> {
  const uriEncodedField = encodeURIComponent(field);
  await fetch(`/temporal-entries/missing?field=${uriEncodedField}`, {
    method: DELETE,
    credentials: INCLUDE,
  });
  return Promise.resolve({ ok: true });
}

export function deleteMissingEntries(field: string): Function {
  return ({ fetch }: any) => ({
    type: DELETE_MISSING,
    payload: {
      promise: deleteMissingEntriesAsync(fetch, field),
    },
  });
}

async function getUploadDataAsync(event: Object): Promise<?FormData> {
  if (!process.env.IS_BROWSER) {
    return Promise.resolve(null);
  }

  const data = new FormData();
  const file = event.target.files[0];
  data.append('file', file);

  const separator = await getCsvSeparatorAsync(file);
  data.append('separator', separator);

  return data;
}

export function getUploadData(event: Event): Action {
  return {
    type: UPLOAD_INPUT_CHANGE,
    payload: {
      promise: getUploadDataAsync(event),
    },
  };
}
