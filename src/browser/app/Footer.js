// @flow
import React from 'react';
import { FormattedHTMLMessage, defineMessages } from 'react-intl';
import './Footer.scss';

// Messages collocation ftw.
// https://github.com/yahoo/react-intl/wiki/API#definemessages
const messages = defineMessages({
  madeByHtml: {
    defaultMessage: '© 2017 <a target="_blank" href="https://robi42.net/">Robert Thurnher</a>',
    id: 'footer.madeByHtml',
  },
});

export const Footer = () => (
  <footer>
    <p>
      <FormattedHTMLMessage {...messages.madeByHtml} />
    </p>
  </footer>
);

export default Footer;
