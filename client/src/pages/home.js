 import styles from './../styles.module.css';
import './../styles.css';
import { useState } from 'react';

 const Home = () => {
  const [editorValue, setEditorValue] = useState(`1. Introduction to UX and UI Design
User Experience (UX) and User Interface (UI) design are two critical components of digital product development. UX focuses on how users interact with a product and aims to make that interaction smooth, intuitive, and enjoyable. UI, on the other hand, centers on the visual and interactive elements—the look and feel of the product. Together, UX and UI work to create digital experiences that are both functional and aesthetically pleasing. Whether designing a mobile app, website, or software interface, balancing user needs with visual appeal is key.

2. Role of PSD Files in UI Design
Photoshop Document (PSD) files are commonly used in UI design as they allow designers to build detailed mockups and prototypes of digital interfaces. Adobe Photoshop, which uses PSD as its native file format, provides designers with precise control over layers, colors, typography, and layout. UI designers often create entire screen designs or interface components in PSD format before handing them off to developers. This helps ensure that visual elements are pixel-perfect and align with brand guidelines.

3. Bridging UX Research and PSD Prototypes
While PSD files are primarily visual, they play an important role in supporting UX design goals. Insights from UX research—such as user behavior, pain points, and usability needs—are translated into wireframes and then refined into high-fidelity PSD mockups. Designers use this process to validate design decisions and improve functionality based on real user data. In many cases, PSD files serve as a visual representation of a UX strategy, combining user insights with refined UI elements.

4. Collaboration Between Designers and Developers
PSD files act as a bridge between the design and development teams. Once a PSD layout is approved, developers use it to extract assets (such as buttons, icons, or background images) and follow visual guidelines for building the actual interface. To streamline collaboration, many teams also use tools that convert PSD files into code or integrate them with platforms like Adobe XD or Figma. Proper organization of layers and naming conventions within PSDs can significantly improve workflow efficiency.

5. The Evolving Landscape of UX/UI Design Tools
While PSD files have long been a standard in UI design, modern UX/UI workflows are increasingly shifting toward more interactive tools like Figma, Sketch, and Adobe XD. These tools offer real-time collaboration, prototyping, and responsive design features that PSD alone does not support. However, PSD remains valuable in situations where detailed graphic control or integration with other Adobe Creative Cloud tools is necessary. Understanding how to effectively use PSD files within the broader context of UX and UI design is still an essential skill for many designers today.`);

  const editorCallback = (e) => {
    const value = e.currentTarget.innerText;
    setEditorValue(value);
  };

  const submitText = () => {
    console.log(editorValue);
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={`${styles.col} ${styles.colMain}`}>
          <div className={styles.editorWrapper}>
            <div
              onInput={editorCallback}
              contentEditable
              suppressContentEditableWarning={true}
              className={styles.editor}
              placeholder="Type or paste your text here..."
            >{editorValue}</div>
            
          </div>
        </div>
        <div className={`${styles.col} ${styles.colSide}`}>
          <div className={styles.box}>Box 2</div>
          <button className={styles.button} onClick={submitText}>
            Detect AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
