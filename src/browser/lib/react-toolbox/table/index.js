import { themr } from 'react-css-themr';
import { TABLE } from 'react-toolbox/lib/identifiers';
import { Checkbox } from 'react-toolbox/lib/checkbox';
import { DatePicker } from 'react-toolbox/lib/date_picker';
import { TimePicker } from 'react-toolbox/lib/time_picker';
import { tableFactory } from './Table';
import tableHeadFactory from './TableHead';
import tableRowFactory from './TableRow';
import TableHeader from './TableHeader';
import theme from './theme.scss';

const applyTheme = Component => themr(TABLE, theme)(Component);
const ThemedTableHead = applyTheme(tableHeadFactory(TableHeader, Checkbox));
const ThemedTableRow = applyTheme(tableRowFactory(Checkbox, DatePicker, TimePicker));
const ThemedTable = applyTheme(tableFactory(ThemedTableHead, ThemedTableRow));

export default ThemedTable;
export { ThemedTable as Table };
