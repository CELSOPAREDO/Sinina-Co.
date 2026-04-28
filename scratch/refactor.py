import os
import re
import shutil
from pathlib import Path

# Base directory
BASE_DIR = Path(r"C:\Users\nicole\web-sys\sinina-co\resources\js")

# The exact files to move. Map: Old Path -> New Path (relative to resources/js)
FILE_MOVES = {
    # Styles
    "App.css": "styles/global.css",
    
    # Layouts
    "components/layouts/AdminLayout.css": "layouts/AdminLayout.css",
    "components/layouts/AdminLayout.jsx": "layouts/AdminLayout.jsx",
    "components/layouts/MainLayout.jsx": "layouts/MainLayout.jsx",
    "components/layouts/UserLayout.css": "layouts/UserLayout.css",
    "components/layouts/UserLayout.jsx": "layouts/UserLayout.jsx",
    
    # UI Components
    "components/SystemModal.css": "components/ui/SystemModal.css",
    "components/SystemModal.jsx": "components/ui/SystemModal.jsx",
    "components/Toast.css": "components/ui/Toast.css",
    "components/Toast.jsx": "components/ui/Toast.jsx",
    "components/Icon.jsx": "components/ui/Icon.jsx",
    
    # Features -> Orders
    "components/AddToCartModal.css": "features/orders/components/AddToCartModal.css",
    "components/AddToCartModal.jsx": "features/orders/components/AddToCartModal.jsx",
    "components/CancelOrderModal.css": "features/orders/components/CancelOrderModal.css",
    "components/CancelOrderModal.jsx": "features/orders/components/CancelOrderModal.jsx",
    "components/PaymentRejectionModal.jsx": "features/orders/components/PaymentRejectionModal.jsx",
    "components/dashboard/RecentOrdersTable.jsx": "features/orders/components/RecentOrdersTable.jsx",
    
    # Features -> Products
    "components/ProductCard.css": "features/products/components/ProductCard.css",
    "components/ProductCard.jsx": "features/products/components/ProductCard.jsx",
    "components/ProductImageUpload.css": "features/products/components/ProductImageUpload.css",
    "components/ProductImageUpload.jsx": "features/products/components/ProductImageUpload.jsx",
    "components/ImageCropper.css": "features/products/components/ImageCropper.css",
    "components/ImageCropper.jsx": "features/products/components/ImageCropper.jsx",
    "components/dashboard/TopSellingProducts.jsx": "features/products/components/TopSellingProducts.jsx",
    "components/dashboard/LowStockAlert.jsx": "features/products/components/LowStockAlert.jsx",
    "components/dashboard/CategoryChart.jsx": "features/products/components/CategoryChart.jsx",
    
    # Features -> Users
    "components/ProfileDropdown.css": "features/users/components/ProfileDropdown.css",
    "components/ProfileDropdown.jsx": "features/users/components/ProfileDropdown.jsx",
    "components/dashboard/AddUserModal.jsx": "features/users/components/AddUserModal.jsx",
    
    # Features -> Dashboard (Analytics)
    "components/dashboard/SalesChart.jsx": "features/dashboard/components/SalesChart.jsx",
    "components/dashboard/StatCard.jsx": "features/dashboard/components/StatCard.jsx",
    
    # Core Components
    "components/Footer.css": "components/core/Footer.css",
    "components/Footer.jsx": "components/core/Footer.jsx",
    "components/Navbar.css": "components/core/Navbar.css",
    "components/Navbar.jsx": "components/core/Navbar.jsx",
    "components/NotificationDropdown.css": "components/core/NotificationDropdown.css",
    "components/NotificationDropdown.jsx": "components/core/NotificationDropdown.jsx",
    
    # Pages -> Admin
    "pages/AdminDashboard.jsx": "pages/admin/AdminDashboard.jsx",
    "pages/AdminHistory.css": "pages/admin/AdminHistory.css",
    "pages/AdminHistory.jsx": "pages/admin/AdminHistory.jsx",
    "pages/AdminOrders.jsx": "pages/admin/AdminOrders.jsx",
    "pages/AdminProducts.jsx": "pages/admin/AdminProducts.jsx",
    "pages/AdminReports.css": "pages/admin/AdminReports.css",
    "pages/AdminReports.jsx": "pages/admin/AdminReports.jsx",
    "pages/AdminUsers.jsx": "pages/admin/AdminUsers.jsx",
    
    # Pages -> User
    "pages/UserCart.css": "pages/user/UserCart.css",
    "pages/UserCart.jsx": "pages/user/UserCart.jsx",
    "pages/UserCheckout.css": "pages/user/UserCheckout.css",
    "pages/UserCheckout.jsx": "pages/user/UserCheckout.jsx",
    "pages/UserDashboard.css": "pages/user/UserDashboard.css",
    "pages/UserDashboard.jsx": "pages/user/UserDashboard.jsx",
    "pages/UserHistory.css": "pages/user/UserHistory.css",
    "pages/UserHistory.jsx": "pages/user/UserHistory.jsx",
    "pages/UserOrders.css": "pages/user/UserOrders.css",
    "pages/UserOrders.jsx": "pages/user/UserOrders.jsx",
    "pages/UserProfile.css": "pages/user/UserProfile.css",
    "pages/UserProfile.jsx": "pages/user/UserProfile.jsx",
    "pages/UserSettings.css": "pages/user/UserSettings.css",
    "pages/UserSettings.jsx": "pages/user/UserSettings.jsx",
    "pages/UserShop.css": "pages/user/UserShop.css",
    "pages/UserShop.jsx": "pages/user/UserShop.jsx",
    
    # Pages -> Public
    "pages/Home.css": "pages/public/Home.css",
    "pages/Home.jsx": "pages/public/Home.jsx",
    "pages/Login.css": "pages/public/Login.css",
    "pages/Login.jsx": "pages/public/Login.jsx",
    "pages/Register.css": "pages/public/Register.css",
    "pages/Register.jsx": "pages/public/Register.jsx",
    "pages/Products.css": "pages/public/Products.css",
    "pages/Products.jsx": "pages/public/Products.jsx",
    "pages/ProductDetails.css": "pages/public/ProductDetails.css",
    "pages/ProductDetails.jsx": "pages/public/ProductDetails.jsx",
    
    # These old Cart/Checkout files seem deprecated but we'll move them to public just in case, or keep them.
    "pages/Cart.css": "pages/public/Cart.css",
    "pages/Cart.jsx": "pages/public/Cart.jsx",
    "pages/Checkout.css": "pages/public/Checkout.css",
    "pages/Checkout.jsx": "pages/public/Checkout.jsx",
    "pages/Profile.css": "pages/public/Profile.css",
    "pages/Profile.jsx": "pages/public/Profile.jsx",
    "pages/Settings.css": "pages/public/Settings.css",
    "pages/Settings.jsx": "pages/public/Settings.jsx",
}

# Create old_to_new absolute path map
old_to_new_abs = {}
new_to_old_abs = {}

for old_rel, new_rel in FILE_MOVES.items():
    old_abs = BASE_DIR / old_rel
    new_abs = BASE_DIR / new_rel
    old_to_new_abs[old_abs] = new_abs
    new_to_old_abs[new_abs] = old_abs

def resolve_import(current_file, import_path):
    # E.g. current_file: pages/Home.jsx, import_path: ../components/Navbar
    if not import_path.startswith('.'):
        return None
    
    # Resolve the absolute path of the import
    curr_dir = current_file.parent
    # split by /
    parts = import_path.split('/')
    
    # Traverse
    target_dir = curr_dir
    for part in parts[:-1]:
        if part == '.':
            continue
        elif part == '..':
            target_dir = target_dir.parent
        else:
            target_dir = target_dir / part
            
    target_name = parts[-1]
    
    # The target might be a file with .jsx, .js, .css or implicit
    # We must match it against actual files in our old_to_new_abs map.
    
    # Potential exact names:
    potentials = [
        target_name,
        target_name + '.jsx',
        target_name + '.js',
        target_name + '.css'
    ]
    
    for p in potentials:
        abs_target = target_dir / p
        # Check if it's in our moves
        if abs_target in old_to_new_abs:
            return abs_target
            
    # If not in moves, it might be a file that isn't moving (e.g. services/api.js)
    for p in potentials:
        abs_target = target_dir / p
        if abs_target.exists():
            return abs_target

    return None

def compute_relative(from_file, to_file):
    from_dir = from_file.parent
    
    try:
        rel = os.path.relpath(to_file, from_dir)
        # Convert windows separators to posix
        rel = rel.replace('\\', '/')
        if not rel.startswith('.'):
            rel = './' + rel
            
        # Strip extensions for JS/JSX
        if rel.endswith('.jsx') or rel.endswith('.js'):
            rel = re.sub(r'\.jsx?$', '', rel)
            
        return rel
    except Exception as e:
        return None

def process_file_imports(file_path, current_location, final_location):
    # We read the file contents, replace imports, and return the new contents
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find import statements
    # import X from "path";
    # import "path";
    import_pattern = re.compile(r'((?:import|export)\s+(?:.*?\s+from\s+)?[\'"])(.*?)([\'"])')
    
    def repl(match):
        prefix = match.group(1)
        imp_path = match.group(2)
        suffix = match.group(3)
        
        target_abs = resolve_import(current_location, imp_path)
        if target_abs:
            # Where is the target going to be?
            final_target_abs = old_to_new_abs.get(target_abs, target_abs)
            
            # Compute new relative path from FINAL location to FINAL TARGET location
            new_rel = compute_relative(final_location, final_target_abs)
            if new_rel:
                return f"{prefix}{new_rel}{suffix}"
                
        return match.group(0)

    new_content = import_pattern.sub(repl, content)
    return new_content

def main():
    print("Starting refactor...")
    
    # 1. First, process all imports IN MEMORY for files that are moving
    # We must also process files that are NOT moving but might import files that ARE moving.
    
    # Get all js/jsx/css files in BASE_DIR
    all_files = []
    for root, _, files in os.walk(BASE_DIR):
        for f in files:
            if f.endswith(('.js', '.jsx', '.css')):
                all_files.append(Path(root) / f)
                
    file_contents = {}
    
    for f in all_files:
        final_loc = old_to_new_abs.get(f, f)
        try:
            new_content = process_file_imports(f, f, final_loc)
            file_contents[f] = new_content
        except Exception as e:
            print(f"Error processing {f}: {e}")
            
    # 2. Apply modifications to files. If a file is moving, we write it to the new location.
    # If it's not moving, we just overwrite it.
    
    # Create required directories
    for old_abs, new_abs in old_to_new_abs.items():
        new_abs.parent.mkdir(parents=True, exist_ok=True)
        
    for f in all_files:
        new_content = file_contents.get(f)
        if new_content is None:
            continue
            
        final_loc = old_to_new_abs.get(f, f)
        
        # Write to final location
        with open(final_loc, 'w', encoding='utf-8') as out:
            out.write(new_content)
            
        # If it moved, we might want to delete the old file later, BUT only if it actually moved.
        
    # 3. Delete old files
    for old_abs in old_to_new_abs.keys():
        if old_abs != old_to_new_abs[old_abs] and old_abs.exists():
            try:
                os.remove(old_abs)
            except:
                pass
                
    # 4. Clean up empty directories
    def remove_empty_dirs(path):
        if not os.path.isdir(path):
            return
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                remove_empty_dirs(item_path)
        try:
            os.rmdir(path)
        except OSError:
            pass

    remove_empty_dirs(BASE_DIR)
    
    print("Refactor complete!")

if __name__ == "__main__":
    main()
