import React, { Component } from 'react'
const axios = require('axios')
const fileDownload = require('js-file-download') 


export class IpOpList extends Component {
    constructor(){
        super()
        this.state = {
            inputFiles : [],
            convertedFiles : []
        }
    }
    componentDidUpdate(){
        
    }
    // getInputFiles = () => {
    //     axios.get('http://techathon.azurewebsites.net/api/Files/ListFiles')
    //     .then(res => {
    //        // console.log(res)
    //         let files = []
    //         for(let f of res.data){
    //             files= [...files,f]
    //         }
    //         this.setState({
    //             inputFiles : this.state.inputFiles.concat(files)
    //         })
    //     })
    // }

    getOutputFiles = () => {
        console.log('acs')
    }

    componentDidMount() {
        // this.getInputFiles()
        // this.getOutputFiles()
        setInterval(()=>{
            this.props.getInputFiles();
            this.props.getOutputFiles();
            console.log("checking for new files...")
        },10000)
    }

    handleDelete = (item) => {
        axios.get(`http://techathon.azurewebsites.net/api/Files/DeleteFile/${item}`)
        .then(res=>{
            console.log(res.data)
            this.props.getInputFiles()
            this.props.getOutputFiles()
            
        })
    }

    handleDownload = (item) => {
        axios.get(`http://techathon.azurewebsites.net/api/Files/DownloadFile/${item}`)
        .then(res => {
            fileDownload(res.data, item)
        })
    }

    render() {
        return (
            <div>
                <div className="section-head">
                    <h2>File Tracker</h2>
                </div>
            <div className="IpOpTable">
                <table className="file-table">
                    <thead>
                    <tr>
                    
                        <th>Input Files</th>

                   
                    </tr>
                    </thead>
                    <tbody>
                   
                            {this.props.inputFiles.map( item => (
                             <tr>
                             <td className="file-n">{item}</td><td><button className="down-but" onClick={this.handleDownload.bind(this,item)}><i className="fa fa-download" aria-hidden="true"></i></button></td><td><button className="del-but" onClick={this.handleDelete.bind(this, item)}><i className="fa fa-trash" aria-hidden="true"></i></button></td><td>
                             </td> 
                             </tr> 
                            ) )}
                       </tbody>
                </table> 
                <table className="file-table">
                    <thead>
                    <tr>
                    
                        <th>CSV Files</th>

                   
                    </tr>
                    </thead>
                    <tbody>
                   
                            {this.props.outputFiles.map( item => (
                             <tr >
                             <td className="file-n">{item} </td><td><button className="down-but" onClick={this.handleDownload.bind(this,item)}><i className="fa fa-download" aria-hidden="true"></i></button></td><td><button className="del-but" onClick={this.handleDelete.bind(this, item)}><i className="fa fa-trash" aria-hidden="true"></i></button></td><td>
                             </td> 
                             </tr> 
                            ) )}
                       </tbody>
                </table> 
               
            </div>
            </div>
        )
    }
}

export default IpOpList
