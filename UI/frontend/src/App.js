import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header'
import FileUploader from './components/FileUploader'
import Scheduler from './components/Scheduler'


class App extends React.Component {
  render(){
    return (
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/" component={Scheduler}/>
          <Route path="/upload" component={FileUploader}/>
        </div>
      </Router>
    );
  }
}

export default App;
