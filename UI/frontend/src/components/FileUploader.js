import React, { Component, createRef } from 'react'
import '../css/FileUploader.css'
import IpOpList from './IpOpList'
import '../css/css/font-awesome.min.css'


const dotenv = require('dotenv')

dotenv.config()

const axios = require('axios')

export class FileUploader extends Component {
    constructor(){
        super()
        this.state = {
            files : [],
            converted : [],
            result : true
            
        }
        this.inputFileRef = createRef()        
            }
    
    componentDidMount(){
        this.getInputFiles()
        this.getOutputFiles()
    }

    uploadFiles =   (file) => {
        const formData = new FormData();
        console.log(file[0])
        formData.append('asset',file[0])
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        axios.post('http://techathon.azurewebsites.net/api/Files/InsertFile', formData, config)
        .then(res=>{
           // console.log('File Uploaded')
           alert("File Uploaded Succesfully!")
           this.getInputFiles()
           
        })
        
    }

    getInputFiles = () => {
        axios.get('http://techathon.azurewebsites.net/api/Files/ListFiles')
        .then(res => {
           // console.log(res)
            let filesCol = []
            for(let f of res.data){
                if( f.split('.').pop() !== 'csv')
                    filesCol= [...filesCol,f]
            }
            this.setState({
                files : filesCol
            })
        })
    }

    getOutputFiles = () => {
        axios.get('http://techathon.azurewebsites.net/api/Files/ListFiles')
        .then(res => {
            let filesCol = []
            for(let f of res.data){
                if( f.split('.').pop() === 'csv')
                    filesCol= [...filesCol,f]
            }
            this.setState({
                converted : filesCol
            })
            //console.log(this.state.converted)
        })
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
                        multiple={false}
                        onChange={e => this.uploadFiles(e.target.files)}
                    />
                    <button className="btn"
                        onClick = {this.handleFileClick}>
                        Click here to upload
                        </button>

                        <hr></hr>
                    <IpOpList getInputFiles={this.getInputFiles} getOutputFiles={this.getOutputFiles} inputFiles={this.state.files} outputFiles={this.state.converted}/>
                </div>
        )
    }
}

export default FileUploader
