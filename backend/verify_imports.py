import sys
from importlib import import_module
from pathlib import Path

def test_imports():
    backend_dir = Path(__file__).parent
    app_dir = backend_dir / "app"
    routers_dir = app_dir / "routers"
    services_dir = app_dir / "services"

    failed = False
    
    # Check all routers
    for f in routers_dir.glob("*.py"):
        if f.name == "__init__.py": continue
        module_name = f"app.routers.{f.stem}"
        try:
            import_module(module_name)
            print(f"✅ Successfully imported {module_name}")
        except Exception as e:
            print(f"❌ Failed to import {module_name}: {e}")
            failed = True

    # Check all services
    for f in services_dir.glob("*.py"):
        if f.name == "__init__.py": continue
        module_name = f"app.services.{f.stem}"
        try:
            import_module(module_name)
            print(f"✅ Successfully imported {module_name}")
        except Exception as e:
            print(f"❌ Failed to import {module_name}: {e}")
            failed = True

    if failed:
        sys.exit(1)
    else:
        print("🎉 All backend modules imported successfully. No broken dependencies.")

if __name__ == "__main__":
    test_imports()
