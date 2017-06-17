// @flow
import * as React from 'react';
import Dialog from 'react-toolbox/lib/dialog';
import Dropdown from 'react-toolbox/lib/dropdown';
import Button from 'react-toolbox/lib/button';
import { connect } from 'react-redux';
import { toggleExportDialog } from '../../common/ui/actions';
import { serverUrl } from '../../common/lib/utils';

type Props = {
  isDialogActive: boolean,
  toggleExportDialog: Function,
};
type TemporalFormat = 'ISO_DATE' | 'ISO_DATE_TIME' | 'EPOCH_MILLIS';
type State = {
  temporalFormat: TemporalFormat,
};

const ISO_DATE = 'ISO_DATE';
const ISO_DATE_TIME = 'ISO_DATE_TIME';
const EPOCH_MILLIS = 'EPOCH_MILLIS';
const DROPDOWN_FORMATS = [
  { label: 'ISO Date — e.g., 2017-12-31', value: ISO_DATE },
  { label: 'ISO Date/Time — e.g., 2017-12-31T12:00:00', value: ISO_DATE_TIME },
  { label: 'Epoch Millis — e.g., 1485037113334', value: EPOCH_MILLIS },
];

export class ExportDialog extends React.Component {

  state: State = {
    temporalFormat: ISO_DATE_TIME,
  };

  props: Props;

  handleDialogToggle() {
    const { toggleExportDialog } = this.props;

    toggleExportDialog();
  }

  handleFormatDropdownChange(dropdownValue: TemporalFormat) {
    this.setState({ temporalFormat: dropdownValue });
  }

  handleDownloadButtonClick() {
    const { toggleExportDialog } = this.props;

    toggleExportDialog();
  }

  render() {
    const { isDialogActive } = this.props;

    return (
      <Dialog
        actions={[
          {
            label: 'Cancel',
            onClick: () => this.handleDialogToggle(),
          },
        ]}
        active={isDialogActive}
        onEscKeyDown={() => this.handleDialogToggle()}
        onOverlayClick={() => this.handleDialogToggle()}
        title="Export CSV"
        type="small"
      >
        <Dropdown
          source={DROPDOWN_FORMATS}
          onChange={value => this.handleFormatDropdownChange(value)}
          label="Temporal format"
          value={this.state.temporalFormat}
        />
        <form method="POST" action={`${serverUrl()}/temporal-entries/export`} target="_blank">
          <input type="hidden" name="temporalFormat" value={this.state.temporalFormat} />
          <Button
            type="submit"
            icon="file_download"
            label="Download"
            primary
            raised
            onClick={() => this.handleDownloadButtonClick()}
          />
        </form>
      </Dialog>
    );
  }

}

export default connect(state => ({
  isDialogActive: state.ui.isExportDialogActive,
}), {
  toggleExportDialog,
})(ExportDialog);
