#!/usr/bin/env python3
import re
import sys
from pathlib import Path

def convert_grid_props(content):
    """Convert Grid breakpoint props to size={{ }} format"""

    # Pattern to match Grid tags with breakpoint props
    # This will match <Grid xs={12} sm={6} md={4}> etc.
    pattern = r'<Grid\s+([^>]*?)>'

    def replace_grid(match):
        props = match.group(1)

        # Extract breakpoint props (xs, sm, md, lg, xl)
        breakpoints = {}
        remaining_props = []

        # Split props by spaces, but keep quoted values together
        prop_pattern = r'(\w+)=\{([^}]+)\}|(\w+)="([^"]+)"|(\w+)=\'([^\']+)\'|(\w+)'

        for m in re.finditer(prop_pattern, props):
            if m.group(1):  # prop={value}
                prop_name = m.group(1)
                prop_value = m.group(2)

                if prop_name in ['xs', 'sm', 'md', 'lg', 'xl']:
                    breakpoints[prop_name] = prop_value
                else:
                    remaining_props.append(f'{prop_name}={{{prop_value}}}')
            elif m.group(3):  # prop="value"
                remaining_props.append(f'{m.group(3)}="{m.group(4)}"')
            elif m.group(5):  # prop='value'
                remaining_props.append(f'{m.group(5)}=\'{m.group(6)}\'')
            elif m.group(7):  # boolean prop
                remaining_props.append(m.group(7))

        # If we found breakpoint props, convert them to size={{ }}
        if breakpoints:
            # Build size object
            size_parts = [f'{bp}: {val}' for bp, val in breakpoints.items()]
            size_prop = f'size={{{{ {", ".join(size_parts)} }}}}'

            # Rebuild Grid tag
            all_props = [size_prop] + remaining_props
            return f'<Grid {" ".join(all_props)}>'
        else:
            # No breakpoint props, return as is
            return match.group(0)

    return re.sub(pattern, replace_grid, content)

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = convert_grid_props(content)

        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated: {file_path}')
            return True
        else:
            print(f'No changes: {file_path}')
            return False
    except Exception as e:
        print(f'Error processing {file_path}: {e}')
        return False

def main():
    # Find all JSX files
    src_dir = Path('src')
    jsx_files = list(src_dir.rglob('*.jsx'))

    print(f'Found {len(jsx_files)} JSX files')

    updated_count = 0
    for file_path in jsx_files:
        if process_file(file_path):
            updated_count += 1

    print(f'\nUpdated {updated_count} files')

if __name__ == '__main__':
    main()
