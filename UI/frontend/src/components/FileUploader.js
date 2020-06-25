import React, { Component, createRef } from 'react'
import '../css/FileUploader.css'
import IpOpList from './IpOpList'
import '../css/css/font-awesome.min.css'
import ProgressBar from './ProgessBar'
import Axios from 'axios';

const dotenv = require('dotenv')



dotenv.config()

const axios = require('axios')

var maxBlockSize = 256 * 1024;//Each file will be split in 256 KB.
var numberOfBlocks = 1;
var selectedFile = null;
var currentFilePointer = 0;
var totalBytesRemaining = 0;
var blockIds = new Array();
var blockIdPrefix = "block-";
var submitUri = null;
var bytesUploaded = 0;
var fileSize = 0
var reader = new FileReader();

export class FileUploader extends Component {
    constructor(){
        super()
        this.state = {
            files : [],
            converted : [],
            result : true,
            uploadPercent : 0,
            displayP : 'none',
            queue : [],
            alreadyCsv : [],
            logger : [],
            sasuri : '',
            
        }

        this.reader = new FileReader()
        this.inputFileRef = createRef()  
        this.dndRef = createRef()      
            }
    
    componentDidMount(){
        this.getInputFiles()
        this.getOutputFiles()

        const dropArea = this.dndRef.current
        console.log(dropArea)
        dropArea.addEventListener('dragover', (event) => {
        event.stopPropagation();
        event.preventDefault();
        // Style the drag-and-drop as a "copy file" operation.
        event.dataTransfer.dropEffect = 'copy';
        });

        dropArea.addEventListener('drop', (event) => {
        event.stopPropagation();
        event.preventDefault();
       // const fileList = event.dataTransfer.files;
           this.uploadFiles(event.dataTransfer.files);
           
        });

        

        
    }

    handleLogger = (fileName) => {
         
        let newText = `File ${fileName} has been added to the queue.`

        this.setState({
            logger : [...this.state.logger,newText]
        })

        let newEle = []
        newEle = Array.prototype.difference(this.state.queue,this.state.converted.filter(ele => !this.state.alreadyCsv.includes(ele) ))

        this.setState({
            logger : [...this.state.logger, `File ${newEle[0]} has been converted to CSV format.`]
        })


        
    }
    
    componentDidUpdate(){
       // console.log("Updated")


    }


    uploadFiles =   (file) => {
        const formData = new FormData();
        console.log(file[0])
        formData.append('asset',file[0])


        const options = {
            headers: {
                'content-type': 'multipart/form-data'
            },
            onUploadProgress : (progressEvent) => {
                const {loaded, total} = progressEvent;
                let percent  = Math.floor(loaded * 100 / total)
                if(percent < 100){
                    this.setState({
                        uploadPercent : percent,
                        displayP : 'flex'
                    })
                }
                
            }
        }
        axios.post('http://techathon.azurewebsites.net/api/Files/InsertFile', formData, options)
        .then(res=>{
           // console.log('File Uploaded')
           this.setState({
               uploadPercent : 100
           },()=>{
               setTimeout(()=>{
                this.setState({
                    uploadPercent : 0,
                    displayP : 'none'
                })
               },1000)
           })
           alert("File Uploaded Succesfully!")
           if(file[0].name.split(".").pop()!=='csv'){
            this.state.queue.push([file[0].name])
           }
           else
            this.state.alreadyCsv.push(file[0].name)
            
           this.getInputFiles()
           
           
        })
        
    }

   
    directUpload = (files) => {
             maxBlockSize = 256 * 1024;
             currentFilePointer = 0;
             totalBytesRemaining = 0;
             if(files[0] === undefined){
                 return
             }
             selectedFile = files[0];
             numberOfBlocks = 1
             fileSize = selectedFile.size;
             blockIds = new Array()
             bytesUploaded = 0
            if (fileSize < maxBlockSize) {
                maxBlockSize = fileSize;
                console.log("max block size = " + maxBlockSize);
            }
            totalBytesRemaining = fileSize;
            if (fileSize % maxBlockSize == 0) {
                numberOfBlocks = fileSize / maxBlockSize;
            } else {
                numberOfBlocks = parseInt(fileSize / maxBlockSize, 10) + 1;
            }
            console.log("total blocks = " + numberOfBlocks);
            var baseUrl = this.state.sasuri
            var indexOfQueryStart = baseUrl.indexOf("?");
            var submitUri = baseUrl.substring(0, indexOfQueryStart) + selectedFile.name + baseUrl.substring(indexOfQueryStart);
            console.log(submitUri);

            
            var fileContent = selectedFile.slice(currentFilePointer, currentFilePointer + maxBlockSize);
            //reader.readAsArrayBuffer(fileContent);

            reader.onloadend =   (evt) => {
                //console.log('hello')
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    var uri = submitUri + '&comp=block&blockid=' + blockIds[blockIds.length - 1];
                    var requestData = new Uint8Array(evt.target.result);
                    var config = {
                        url: uri,
                        method: "put",
                        data: requestData,
                        headers: {
                            'x-ms-blob-type': 'BlockBlob',
                            'x-ms-date' : '2020-06-25',
                            'x-ms-version' : '2019-07-07'
                        }
                    }

                    Axios(config)
                    .then(
                        res=> {
                            console.log(res)
                            //console.log(this)
                            bytesUploaded += requestData.length;
                        var percentComplete = ((parseFloat(bytesUploaded) / parseFloat(selectedFile.size)) * 100).toFixed(2);
                        
                        if(percentComplete < 100){
                            this.setState({
                                uploadPercent : percentComplete,
                                displayP : 'flex'
                            })
                        }

                            this.uploadFileInBlocks(selectedFile,submitUri)
                        }
                    )
            }
           // console.log(evt)
            }
            
            this.uploadFileInBlocks(selectedFile,submitUri)
            
    }


    uploadFileInBlocks = (selectedFile,submitUri)=>{
        if (totalBytesRemaining > 0) {
            console.log(totalBytesRemaining)
            console.log("current file pointer = " + currentFilePointer + " bytes read = " + maxBlockSize);
            var fileContent = selectedFile.slice(currentFilePointer, currentFilePointer + maxBlockSize);
            var blockId = blockIdPrefix + this.pad(blockIds.length, 6);
            console.log("block id = " + blockId);
            blockIds.push(btoa(blockId));
            reader.readAsArrayBuffer(fileContent);
            currentFilePointer += maxBlockSize;
            totalBytesRemaining -= maxBlockSize;
            if (totalBytesRemaining < maxBlockSize) {
                maxBlockSize = totalBytesRemaining;
            }
           
        } else {
            this.commitBlockList(submitUri);
           
        }
       
    }
    commitBlockList(submitUri) {
        var uri = submitUri + '&comp=blocklist';
        console.log(submitUri)
        console.log(uri);
        var requestBody = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
        for (var i = 0; i < blockIds.length; i++) {
            requestBody += '<Latest>' + blockIds[i] + '</Latest>';
        }
        requestBody += '</BlockList>';
        //console.log(requestBody);
        
        var config = {
            url: uri,
            method: "put",
            data: requestBody,
            headers : {
                'x-ms-blob-content-type': selectedFile.type,
                'x-ms-date' : '2020-06-25',
                'x-ms-version' : '2019-07-07'
            }
        }

        Axios(config)
        .then((resolve,reject) => {
            this.setState({
                uploadPercent : 100
            },()=>{
                setTimeout(()=>{
                 this.setState({
                     uploadPercent : 0,
                     displayP : 'none'
                 })
                },1000)
            })
            console.log("Upload success!")
            reader = new FileReader()
        })
        .catch(err => {
            console.log(err)
        })

    }
    pad(number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
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

    handleSASURI(ele){
        this.setState({
            sasuri : ele.target.value
        })
    }
    render() {
        return (
            <div className="fileuploadbox">
                    <div><h1>Upload file to Blob location</h1></div>
                    <h2>
                            SAS URI
                        </h2>
                       <div> <input type='text' onChange={this.handleSASURI.bind(this)} value={this.state.sasuri} placeholder="Enter SAS URI here" style={{width: '60%', height : '30px'}} /> </div>
                    <input 
                        style={{ display: 'none' }}
                        name="input-file"
                        ref={this.inputFileRef}
                        type="file"
                        multiple={false}
                        onChange={e => this.directUpload(e.target.files)}
                    />
                    <button className="btn"
                        onClick = {this.handleFileClick}>
                        Click here to upload
                        </button>

                        <div className="progress-box">
                            <div className="progress">
                            <ProgressBar displayP={this.state.displayP} percent ={this.state.uploadPercent}/>
                            </div>
                        </div>
                    <div className="dnd">
                        <div className="drop-zone" ref={this.dndRef}></div>
                    </div>
                        <hr></hr>
                    <IpOpList getInputFiles={this.getInputFiles} getOutputFiles={this.getOutputFiles} inputFiles={this.state.files} outputFiles={this.state.converted}/>
                </div>
        )
    }
}

export default FileUploader
