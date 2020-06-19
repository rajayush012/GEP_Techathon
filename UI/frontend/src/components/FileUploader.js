import React, { Component, createRef } from 'react'
import '../css/FileUploader.css'
import IpOpList from './IpOpList'
import '../css/css/font-awesome.min.css'
import ProgressBar from './ProgessBar'

const dotenv = require('dotenv')

dotenv.config()

const axios = require('axios')

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
            
            
        }
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
           if(file[0].split(".").pop()!=='csv'){
            this.state.queue.push([file[0].name])
           }
           else
            this.state.alreadyCsv.push(file[0].name)
            
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
