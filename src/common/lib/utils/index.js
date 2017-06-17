// @flow
import { Duration } from 'js-joda';
import { List } from 'immutable';

const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

const HttpHeader = {
  CONTENT_TYPE: 'Content-Type',
};

const MediaType = {
  APPLICATION_JSON: 'application/json',
};

const Elasticsearch = {
  ID: '_id',
  TIMESTAMP: '_timestamp',
};

const serverUrl = (): string => process.env.SERVER_URL || 'http://localhost:8888';

const supportsBrowserNotification = (): boolean => 'Notification' in window; // eslint-disable-line no-undef, max-len

const fromUtcDate = (epochMillisOrIsoDateTime: number | string): Date => {
  const date = new Date(epochMillisOrIsoDateTime);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date;
};

const toUtcDate = (epochMillisOrIsoDateTime: number | string): Date => {
  const date = new Date(epochMillisOrIsoDateTime);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date;
};

const secondsAsMillis = (seconds: number): number => Duration.ofSeconds(seconds).toMillis();

const Durations = {
  ONE_SECOND_AS_MILLIS: secondsAsMillis(1),
  THREE_SECONDS_AS_MILLIS: secondsAsMillis(3),
  TEN_SECONDS_AS_MILLIS: secondsAsMillis(10),
};

class Strings {
  static isNullOrEmpty(s: string): boolean {
    return s === null || s === '';
  }
}

const getDropdownSource = (fields: List<string>): Object[] => fields ?
  fields.toJS().map(it => ({ label: it, value: it })) : [];

const getDropdownValue = (dropdownValue: ?string, fieldOfInterest: ?string): ?string =>
  dropdownValue && fieldOfInterest && (dropdownValue !== fieldOfInterest) ?
    fieldOfInterest :
    dropdownValue;

export {
  HttpMethod,
  HttpHeader,
  MediaType,
  Elasticsearch,
  Strings,
  Durations,
  fromUtcDate,
  toUtcDate,
  secondsAsMillis,
  serverUrl,
  supportsBrowserNotification,
  getDropdownSource,
  getDropdownValue,
};
