import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header'
import FileUploader from './components/FileUploader'
import Logs from './components/Logs'

import About from './components/About'

const dotenv = require('dotenv')
dotenv.config()


class App extends React.Component {
  render(){
    return (
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/" component={FileUploader}/>
          <Route path="/logs" component={Logs}/>
          <Route path="/about" component={About} />
        </div>
      </Router>
    );
  }
}

export default App;
