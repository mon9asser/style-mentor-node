 import styles from './../styles.module.css';
import './../styles.css';
import { useState } from 'react';

 const Phrases = () => {
  const [phrasesValues, setphrasesValues] = useState(``);
  

  var SetInArrayCallback = (value) => {
    console.log(value);
  }

  const editorCallback = (e) => {
    const value = e.currentTarget.innerText;
    SetInArrayCallback(value)
    setphrasesValues(value);
  };

  const submitText = () => {
    console.log(phrasesValues);
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={`${styles.col} ${styles.colMain}`}>
        <h1>
            Insert AI Phrases
        </h1>
          <div className={styles.editorWrapper}>
            <textarea
              onInput={editorCallback}
              className={styles.editor}
              placeholder="Type or paste your text here..."
            >{phrasesValues}</textarea>
          </div>
          <button className={styles.button} onClick={submitText}>
            Detect AI
          </button>
        </div> 

        <div className={`${styles.col} ${styles.colSide}`}>
            <h3>Preview</h3>
          <div className={styles.box}>
             
            <div>
                <ul>
                    <li>This is</li>
                    <li>This is</li>
                    <li>This is</li>
                    <li>This is</li>
                    <li>This is</li>
                    <li>This is</li>
                    <li>This is</li>
                    <li>This is</li>
                </ul>
            </div>
          </div>
           
        </div>
      </div>
    </div>
  );
};

export default Phrases;
