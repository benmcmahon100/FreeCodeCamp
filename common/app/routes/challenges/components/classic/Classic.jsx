import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'react-bootstrap';
import { createSelector } from 'reselect';
import PureComponent from 'react-pure-render/component';

import Editor from './Editor.jsx';
import SidePanel from './Side-Panel.jsx';
import Preview from './Preview.jsx';
import BugModal from '../Bug-Modal.jsx';
import ClassicModal from '../Classic-Modal.jsx';
import { challengeSelector } from '../../redux/selectors';
import {
  executeChallenge,
  updateFile,
  loadCode,
  submitChallenge,
  closeChallengeModal,
  updateSuccessMessage
} from '../../redux/actions';
import { randomCompliment } from '../../../../utils/get-words';

const mapStateToProps = createSelector(
  challengeSelector,
  state => state.challengesApp.id,
  state => state.challengesApp.tests,
  state => state.challengesApp.files,
  state => state.challengesApp.key,
  state => state.challengesApp.isChallengeModalOpen,
  state => state.challengesApp.successMessage,
  (
    { showPreview, mode },
    id,
    tests,
    files = {},
    key = '',
    isChallengeModalOpen,
    successMessage,
  ) => ({
    id,
    content: files[key] && files[key].contents || '',
    file: files[key],
    showPreview,
    mode,
    tests,
    isChallengeModalOpen,
    successMessage
  })
);

const bindableActions = {
  executeChallenge,
  updateFile,
  loadCode,
  submitChallenge,
  closeChallengeModal,
  updateSuccessMessage
};

const editors = {
  html: (
    <Editor
      mode={ 'text/html' }
    />
  ),
  css: (
    <Editor
      mode={ 'css' }
    />
  )
};

export class Challenge extends PureComponent {
  static displayName = 'Challenge';

  static propTypes = {
    id: PropTypes.string,
    showPreview: PropTypes.bool,
    content: PropTypes.string,
    mode: PropTypes.string,
    file: PropTypes.object,
    updateFile: PropTypes.func,
    executeChallenge: PropTypes.func,
    loadCode: PropTypes.func,
    submitChallenge: PropTypes.func,
    isChallengeModalOpen: PropTypes.bool,
    closeChallengeModal: PropTypes.func,
    successMessage: PropTypes.string,
    updateSuccessMessage: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {editor: 'html'};

    this.editor = this.editor.bind(this);
    this.setEditor = this.setEditor.bind(this);
  }

  componentDidMount() {
    this.props.loadCode();
    this.props.updateSuccessMessage(randomCompliment());
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id) {
      this.props.loadCode();
      this.props.updateSuccessMessage(randomCompliment());
    }
  }

  renderPreview(showPreview) {
    if (!showPreview) {
      return null;
    }
    return (
      <Col
        lg={ 3 }
        md={ 4 }
        >
        <Preview />
      </Col>
    );
  }

  setEditor(data) {

    if (Object.keys(data).indexOf('target') > -1) {
      data = data.target;
      data = data.dataset;
    }

    console.log(data);

    if (data.hasOwnProperty('editor')) {
      console.log(data.editor);
      return this.setState({currentEditor: data.editor});
    }
    else {
      console.error('Oops!');
    }

  }


  editor(content, executeChallenge, file, updateFile) {
    return (
      React.cloneElement(editors[this.state.editor], {
        content: content,
        executeChallenge: executeChallenge,
        updateFile: content => updateFile(content, file)
      })
    );
  }d

  render() {
    const {
      content,
      updateFile,
      file,
      showPreview,
      executeChallenge,
      submitChallenge,
      successMessage,
      isChallengeModalOpen,
      closeChallengeModal
    } = this.props;

    return (
      <div>
        <Col
          lg={ showPreview ? 3 : 4 }
          md={ showPreview ? 3 : 4 }
          >
          <SidePanel />
        </Col>
        <Col
          lg={ showPreview ? 6 : 8 }
          md={ showPreview ? 5 : 8 }
          >
          <Row>
            <Col
              lg = {12}
              md = {6}
              >
                <Button
                  data-editor = {'html'}
                  onClick = {this.setEditor}
                  style = {{width: "100%"}}
                >
                  HTML
                </Button>
            </Col>
            <Col
              lg = {12}
              md = {6}
              >
                <Button
                  data-editor = {'css'}
                  onClick = {this.setEditor}
                  style = {{width: "100%"}}
                >
                  CSS
                </Button>
            </Col>
          </Row>
          <Row>
            <Col
              lg = {12}
              md = {12}
              >
              { this.editor(content, executeChallenge, file, updateFile) }
            </Col>
          </Row>
        </Col>
        { this.renderPreview(showPreview) }
        <BugModal />
        <ClassicModal
          close={ closeChallengeModal }
          open={ isChallengeModalOpen }
          submitChallenge={ submitChallenge }
          successMessage={ successMessage }
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, bindableActions)(Challenge);
