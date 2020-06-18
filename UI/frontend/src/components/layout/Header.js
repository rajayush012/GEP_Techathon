import React from 'react'
import '../../css/Header.css'
import {Link} from 'react-router-dom';

export default function Header() {
    return (
        <div className="navbar">
            <div className="brand">CSV Converter Scheduler</div>
            <div className="nav-links">
                <ul>
                <Link to="/"><li>Scheduler</li></Link>
                <Link to="/upload"><li>Upload a file to Blob</li></Link>
                </ul>
            </div>
        </div>
    )
}
