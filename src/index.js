import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const remote = window.require('electron').remote

const {
  ipcRenderer
} = window.require('electron')

const {
  BrowserWindow,
  Menu,
  MenuItem
} = window.require('electron').remote

const initContextMenu = () => {
  const menu = new Menu()
  menu.append(new MenuItem({
    label: 'Cut',
    type: 'normal',
    role: 'cut'
  }))
  menu.append(new MenuItem({
    label: 'Copy',
    type: 'normal',
    role: 'copy'
  }))
  menu.append(new MenuItem({
    label: 'Paste',
    type: 'normal',
    role: 'paste'
  }))
  menu.append(new MenuItem({
    label: 'Select all',
    type: 'normal',
    role: 'selectall'
  }))
  window.addEventListener('contextmenu', e => {
    e.preventDefault()
    menu.popup(remote.getCurrentWindow())
  }, false)
}

ipcRenderer.on('initialized', (event, params) => {
  initContextMenu()
  const cyrestPort = params.cyrestPort
  console.log("CyREST is listening on " + cyrestPort)
})

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
