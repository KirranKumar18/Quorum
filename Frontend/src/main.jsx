
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route,Routes } from 'react-router-dom'
import './index.css'
import Authentication from './Authentication'
import HomePage from './Homepage'


createRoot(document.getElementById('root')).render(
      <BrowserRouter>
          <Routes>
              <Route path='/'  element={<Authentication/>}></Route>
              <Route path='/chatRoom'  element ={<HomePage/>}></Route>
          </Routes>
      </BrowserRouter>
)
