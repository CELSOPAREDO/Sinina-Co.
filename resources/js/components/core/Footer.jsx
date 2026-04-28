import React from "react";
import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-brand">
                    <span className="footer-mark" aria-hidden="true">SC</span>
                    <span>Sinina Co.</span>
                </p>
                <p className="footer-tagline">
                    Affordable locally made fashion — supporting local entrepreneurship.
                </p>
                <p className="footer-copy">
                    &copy; {new Date().getFullYear()} Sinina Co. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
