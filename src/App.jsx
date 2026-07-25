import { Routes ,Route } from "react-router-dom"
import Navbar from "./components/Navbar"

function Home(){
  return(
    <h1>Home</h1>
  )
}

function App() {
  return(
  <>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />}>
        

        </Route>
      </Routes>
  </>
  )
}

export default App
