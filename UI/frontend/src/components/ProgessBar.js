import React, { Component } from 'react'



export class ProgessBar extends Component {

    getStyle = () => {
        return {
            background: 'rgba(255,255,255,0.1)',
            justifyContent: 'flex-start',
            borderRadius: '100px',
            alignItems: 'center',
            position: 'relative',
            padding: '0 5px',
            height: '10px',
            width: '40%',
            transition: '0.3s',
            margin : '30px auto',
            display : `${this.props.displayP}`
    }
}
    
     thumbStyle = () => {
        // console.log(this.props.percent)
        return {
            boxShadow: '0 10px 40px -10px #fff',
            borderRadius: '100px',
            background: '#fff',
            height: '8px',
            width: `${this.props.percent}%`
    }
}

    render() {
        return (
            <div style={this.getStyle()}>
                <div style={this.thumbStyle()}>

                </div>
            </div>
        )
    }
}

export default ProgessBar
