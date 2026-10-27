export function Banner() { return (<>
    <div className="banner">
        <img src="/images/deakin1.jpeg" alt="Deakin University campus" className="banner-img" />
        <div className="banner-overlay">
            Hi, I am Aakash
        </div>
    </div>

    
</>) }
export function Profile() { return (<div className="info-section">
        <img src="/images/Aakash.jpeg" alt="Aakash" className="profile-img" />
        <div className="info-text">
            <p>I am a full-stack web developer based in Melbourne, Australia.</p>
            <hr className="info-hr" />
        </div>
    </div>

) }
export function Projects() { return (<><h1 className="section-title">
        Here's what I've done so far
    </h1>

    
    <div className="project project-right">
        <img src="/images/1.png" alt="Student Registration Website" />
        <div className="project-content">
            <h3>Student Registration Website</h3>
            <p>A Java application that manages students registrations by taking different details.</p>
        </div>
    </div>

    
    <div className="project project-left">
        <img src="/images/BMI.png" alt="BMI Calculator" />
        <div className="project-content">
            <h3>BMI Calculator</h3>
            <p>A BMI Calculator developed by combination of HTML, CSS AND JAVA that calculates BMI by taking height and weight inputs.</p>
        </div>
    </div>

    
    <div className="project project-left">
        <img src="/images/project3.png" alt="Personal Portfolio Website" />
        <div className="project-content">
            <h3>Personal Portfolio Website</h3>
            <p>A responsive website built using HTML and CSS to showcase skills, projects, and contact information using AI knowledge.</p>
        </div>
    </div>

</>) }
export function Gallery() { return (<><hr className="divider" />

    <h1 className="gallery-title">
        Image Gallery
    </h1>

    
    <div className="gallery">
        <img src="/images/g1.jpg" alt="Gallery photograph 1" />
        <img src="/images/g2.jpg" alt="Gallery photograph 2" />
        <img src="/images/g3.jpg" alt="Gallery photograph 3" />
        <img src="/images/g4.jpg" alt="Gallery photograph 4" />
    </div>

    </>) }
