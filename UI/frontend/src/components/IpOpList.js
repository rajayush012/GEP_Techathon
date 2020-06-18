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
            <div className="IpOpTable">
                <table>
                    <thead>
                    <tr>
                    
                        <th>Input Files</th>
                        <th>Converted Files</th>
                   
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>
                            {this.props.inputFiles.map( item => (
                                <li key={this.props.inputFiles.indexOf(item)}>{item} {' '} <button className="down-but" onClick={this.handleDownload.bind(this,item)}>Download</button><button className="del-but" onClick={this.handleDelete.bind(this, item)}>X</button></li>
                                
                            ) )}
                        
                        </td>
                        <td>{this.props.outputFiles.map( item => (
                                <li key={this.props.outputFiles.indexOf(item)}>{item} {' '} <button className="down-but" onClick={this.handleDownload.bind(this,item)}>Download</button><button className="del-but" onClick={this.handleDelete.bind(this, item)}>X</button></li>
                                
                            ) )}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default IpOpList
