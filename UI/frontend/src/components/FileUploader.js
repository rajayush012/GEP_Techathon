import React, { Component, createRef } from 'react'
import '../css/FileUploader.css'

const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");
 

const account = "storageaccountgepte86f5";
const defaultAzureCredential = new DefaultAzureCredential();
 
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  defaultAzureCredential
);


export class FileUploader extends Component {
    constructor(){
        super()
        this.state = {
            files : [],
            
        }
        this.inputFileRef = createRef()
    }
    
    

    uploadFiles = (files) => {
        console.log(files)
    }

    handleFileClick =() =>{
        this.inputFileRef.current && this.inputFileRef.current.click();
    }

    render() {
        return (
            <div className="fileuploadbox">
                    <div><h1>Upload file to Blob location</h1></div>
                    <input 
                        style={{ display: 'none' }}
                        name="input-file"
                        ref={this.inputFileRef}
                        type="file"
                        multiple={true}
                        onChange={e => this.uploadFiles(e.target.files)}
                    />
                    <button className="btn"
                        onClick = {this.handleFileClick}>
                        Click here to upload
                        </button>

                        <hr></hr>
                    
                </div>
        )
    }
}

export default FileUploader
