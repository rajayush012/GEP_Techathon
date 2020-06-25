import React, { Component } from 'react'
import '../css/Logs.css'
import Axios from 'axios';

import LoadingSpinner from './LoadingSpinner'

export class Logs extends Component {
    constructor() {
        super()
        this.state = {
            logs: [],
            loading : true
        }
    }

    componentDidMount() {
        var config = {
            url: 'https://storageaccountgepte86f5.file.core.windows.net/scheduledfileconverter91d0/Logs.txt?sv=2019-10-10&ss=bfqt&srt=sco&sp=rwdlacupx&se=2020-06-28T21:42:19Z&st=2020-06-24T13:42:19Z&spr=https&sig=ym9RFOSl0BeMYq4IQdih5ojoOZWF2N4%2BbsgTGCdi5Xw%3D',
            headers: {
                'x-ms-version': '2019-07-07',
                'x-ms-date': '2020-06-25'
            },
            method: 'get'
        }



        setInterval(() => {
            Axios(config)
                .then(response => {
                   // console.log(response.data.length)
                    let data = response.data.split('[Information]')
                    
                    console.log(data.length)
                    this.setState({
                        logs: data,
                        loading: false
                    },function (){
                        var element = document.getElementById("scroller");
                        element.scrollTop = element.scrollHeight;
                    })
                })
        }, 7000)
    }

    render() {
      //  console.log(ScrollAxes)
        return (
            <div className="logSection">
                <hr />
                <div className="logs" >
                    <h1>Logs</h1>
                    
                        <div id="scroller" className='logger'>
                            
                            {this.state.loading ? <LoadingSpinner /> : this.state.logs.map((log, i) => {
                                if(i==this.state.logs.length-1){
                                    return <div className="log inverted">{log}</div>
                                }
                                return <div className="log">{log}</div>
                            })}
                        </div>
                    

                </div>
            </div>
        )
    }
}

export default Logs
