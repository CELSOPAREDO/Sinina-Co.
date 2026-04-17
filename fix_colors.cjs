const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'resources/js/components/layouts/AdminLayout.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/background: #f9fafb;/g, 'background: #EAEFEF;');
css = css.replace(/background: #1f2937;/g, 'background: #25343F;');
css = css.replace(/color: #9ca3af;/g, 'color: #BFC9D1;');
css = css.replace(/border-bottom-color: #3b82f6;/g, 'border-bottom-color: #FF9B51;');
css = css.replace(/background: #3b82f6;/g, 'background: #FF9B51;'); // avatar and btn-primary
css = css.replace(/color: #111827;/g, 'color: #25343F;');
css = css.replace(/border-bottom: 1px solid #e5e7eb;/g, 'border-bottom: 1px solid #BFC9D1;');
css = css.replace(/background: #f9fafb;/g, 'background: #EAEFEF;'); // table th background
css = css.replace(/color: #4b5563;/g, 'color: #25343F;'); // table th color

// Also add some styling for .admin-brand
css = css.replace(/\.admin-brand \{\n    font-weight: bold;\n    font-size: 1.25rem;\n\}/g, '.admin-brand {\n    font-weight: bold;\n    font-size: 1.25rem;\n    color: #FF9B51;\n}');

fs.writeFileSync(cssPath, css);


// AdminDashboard.jsx
const dashPath = path.join(__dirname, 'resources/js/pages/AdminDashboard.jsx');
let dash = fs.readFileSync(dashPath, 'utf8');
dash = dash.replace(/background: '#eff6ff'/g, "background: '#FFFFFF'");
dash = dash.replace(/border: '1px solid #bfdbfe'/g, "border: '1px solid #BFC9D1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'");
dash = dash.replace(/color: '#1e3a8a'/g, "color: '#25343F'");
dash = dash.replace(/color: '#1d4ed8'/g, "color: '#FF9B51'");
dash = dash.replace(/border: '1px solid #e5e7eb'/g, "border: '1px solid #BFC9D1'");
fs.writeFileSync(dashPath, dash);


// AdminProducts.jsx
const prodPath = path.join(__dirname, 'resources/js/pages/AdminProducts.jsx');
let prod = fs.readFileSync(prodPath, 'utf8');
prod = prod.replace(/border: '1px solid #e5e7eb'/g, "border: '1px solid #BFC9D1'");
prod = prod.replace(/borderTop: '1px solid #e5e7eb'/g, "borderTop: '1px solid #BFC9D1'");
fs.writeFileSync(prodPath, prod);

// AdminOrders.jsx
const orderPath = path.join(__dirname, 'resources/js/pages/AdminOrders.jsx');
let ord = fs.readFileSync(orderPath, 'utf8');
ord = ord.replace(/background: '#dbeafe', color: '#1e40af'/g, "background: '#EAEFEF', color: '#25343F'");
fs.writeFileSync(orderPath, ord);

console.log("Colors updated.");
