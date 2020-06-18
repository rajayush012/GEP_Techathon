import React, { Component } from 'react'
import '../css/Scheduler.css'
import Logs from './Logs'

export class Scheduler extends Component {
    constructor(){
        super();
        this.state = {
            status : 'stopped',
            buttonVal : 'Start'
        }
    }

    componentDidMount(){

    }

    handleStartScheduler(){
        this.setState({
            status : this.state.status === 'active' ? 'stopped' : 'active',
            buttonVal : this.state.buttonVal === 'Start' ? 'Stop' : 'Start'
        })
    }

    getStyle = () => {
        return this.state.status === 'active' ? {display : 'block'} : {display : 'none'}
    }

    render() {
        return (
            <div>
                <div className="buttons">
                    <button className={this.state.status} onClick={this.handleStartScheduler.bind(this)}>
                    {this.state.buttonVal} Scheduler
                    </button>
                </div>
               
                <Logs style={this.getStyle()}/>
            </div>
        )
    }
}

export default Scheduler
