import React from 'react';
import logo from './logo.svg';
import {Howl} from 'howler';
import './App.css';
// @ts-ignore
import soundfile from "./imagine.mp3"

const App: React.FC = () => {
    const [sound, setSound] = React.useState<Howl | null>(null)

    React.useEffect(() => {
        const howler = new Howl({
            src: [soundfile],
            autoplay: false,
            loop: true,
            volume: 0.5,
            onend: function () {
                console.log('Finished!');
            }
        });
        setSound(howler)
    }, [])

    const playSound = React.useCallback(() => {
        sound?.play()
    }, [sound])

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p onClick={playSound}>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
