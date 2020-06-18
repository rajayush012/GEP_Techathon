import React, { Component } from 'react'

export class Logs extends Component {
    render() {
        return (
        <div className="logSection" style={this.props.style}>
                <hr/>
                <div className="logs" >
                    Logs
                </div>
            </div>
        )
    }
}

export default Logs
