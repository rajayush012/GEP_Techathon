import React from 'react'
import '../../css/Header.css'
import {NavLink} from 'react-router-dom';

export default function Header() {
    return (
        <div className="navbar">
            <div className="brand">CSV Converter Scheduler</div>
            <div className="nav-links">
                <ul>
                <NavLink activeStyle={{ color: 'red' }} to="/"><li>Upload a file to Blob</li></NavLink>
                </ul>
            </div>
        </div>
    )
}
