import fs from 'fs';
import path from 'path';

const descriptorsToMessages = descriptors =>
  descriptors.reduce((previous, { defaultMessage, id }) => ({
    ...previous, [id]: defaultMessage,
  }), {});

const loadMessages = (options) => {
  const {
    includeDefault = false,
  } = options || {};
  const isDictionary = filename =>
    path.extname(filename) === '.js' &&
    (includeDefault || !filename.startsWith('_'));
  return fs.readdirSync('messages')
    .filter(isDictionary)
    .map(filename => ({
      descriptors: require(`../../../messages/${filename}`).default, // eslint-disable-line import/no-dynamic-require
      locale: filename.split('.')[0],
    }))
    .reduce((previous, { descriptors, locale }) => ({
      ...previous, [locale]: descriptorsToMessages(descriptors),
    }), {});
};

export default loadMessages;
