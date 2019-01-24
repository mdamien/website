/* global API_URL */
import React, {Component} from 'react';
import {AtomicBlockUtils} from 'draft-js';
import {ENTITY_TYPE} from 'draftail';
import Dropzone from 'react-dropzone';

import client from '../../client';
import {getImageDimensions} from '../../utils';
import Button from '../misc/Button';
import CardModal from '../misc/CardModal';
import ImageIcon from 'material-icons-svg/components/baseline/InsertPhoto';

// Source
class ImageSource extends Component {
  state = {
    loading: false,
    file: null
  };

  addEntity = (option) => {
    const {editorState, entityType, onComplete} = this.props;

    const resolvedSrc = `${API_URL}/assets/${option.src}`;

    getImageDimensions(resolvedSrc, (width, height) => {

      const content = editorState.getCurrentContent();
      const contentWithEntity = content.createEntity(
        entityType.type,
        'IMMUTABLE',
        {src: option.src, width, height}
      );

      const entityKey = contentWithEntity.getLastCreatedEntityKey();
      const nextState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' '
      );

      return onComplete(nextState);
    });
  };

  handleDrop = acceptedFiles => {
    this.setState({file: acceptedFiles[0]});
  };

  handleSubmit = () => {
    if (!this.state.file)
      return;

    this.setState({loading: true});

    client.upload(this.state.file, result => {
      this.setState({loading: false});
      this.addEntity({src: result.name});
    });
  };

  handleCancel = () => {
    const {onClose} = this.props;

    return onClose();
  };

  render() {
    const {
      loading,
      file
    } = this.state;

    return (
      <CardModal onClose={this.handleCancel}>
        {[

          // Title
          'Importing an image',

          // Body
          !file ?
            <Dropzone key="body" onDrop={this.handleDrop} /> :
            (
              <div key="body">
                <img src={URL.createObjectURL(file)} style={{height: '200px'}} />
              </div>
            ),

          // Footer
          (
            <Button
              key="footer"
              disabled={!file}
              loading={loading}
              onClick={this.handleSubmit}>
              Upload & Insert
            </Button>
          )
        ]}

      </CardModal>
    );
  }
}

// Block
function ImageBlock(props) {
  const blockProps = props.blockProps;
  const {src} = blockProps.entity.getData();

  // NOTE: can access mutators here

  const url = `${API_URL}/assets/${src}`;

  return (
    <div className="editor image-container">
      <img src={url} />
    </div>
  );
}

// Entity
const IMAGE = {
  type: ENTITY_TYPE.IMAGE,
  icon: <ImageIcon width={24} height={24} />,
  source: ImageSource,
  block: ImageBlock,
  attributes: [
    'height',
    'width',
    'src'
  ]
};

export default IMAGE;
