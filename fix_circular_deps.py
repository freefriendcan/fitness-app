#!/usr/bin/env python3
"""
Fix circular dependency issues in React Native/Expo files.
Converts top-level StyleSheet.create() that use Colors to getStyles() + useMemo pattern.
"""

import re
import os
import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if file has the problematic pattern
    if 'const styles = StyleSheet.create' not in content:
        print(f"Skipping {filepath} - no top-level styles")
        return False
    
    if 'Colors.' not in content:
        print(f"Skipping {filepath} - no Colors usage")
        return False
    
    # Check if already fixed
    if 'const getStyles = () =>' in content or 'getStyles()' in content:
        print(f"Skipping {filepath} - already fixed")
        return False
    
    modified = content
    
    # 1. Add useMemo to React import if not present
    if 'useMemo' not in modified:
        # Handle different import patterns
        if "import React, {" in modified:
            modified = re.sub(
                r"import React, \{([^}]+)\}",
                r"import React, { useMemo,\1}",
                modified
            )
        elif "import React from 'react'" in modified:
            modified = modified.replace(
                "import React from 'react'",
                "import React, { useMemo } from 'react'"
            )
        else:
            # Handle multiline import
            modified = re.sub(
                r"import React,\s*\{",
                "import React, { useMemo,",
                modified
            )
    
    # 2. Convert "const styles = StyleSheet.create({" to "const getStyles = () => StyleSheet.create({"
    modified = re.sub(
        r'const styles = StyleSheet\.create\(\{',
        'const getStyles = () => StyleSheet.create({',
        modified
    )
    
    # 3. Find the component function and add useMemo after the first line
    # Look for patterns like: "export const ComponentName: React.FC" or "export const ComponentName = ("
    
    # Find all function component patterns and add styles useMemo
    # Pattern to find component start with existing hooks
    
    # Find the component body - look for first useState or useEffect or similar
    hook_patterns = [
        r'(const \w+ = use\w+\([^)]*\);)',  # First hook call
        r'(const \{\s*\w+[^}]*\}\s*=\s*use\w+\([^)]*\);)',  # Destructured hook
    ]
    
    # Instead, add styles = useMemo after the component function opening
    # Find component function pattern: "export const XXXScreen: React.FC<...> = ..." or similar
    component_pattern = r'(export const \w+(?:Screen|Component)?(?::\s*React\.FC[^=]*)?\s*=\s*\([^)]*\)\s*=>\s*\{)'
    
    match = re.search(component_pattern, modified)
    if match:
        component_start = match.end()
        # Insert styles useMemo right after the opening brace
        insert_text = "\n  const styles = useMemo(() => getStyles(), []);\n"
        modified = modified[:component_start] + insert_text + modified[component_start:]
    else:
        # Try alternative pattern for function components
        alt_pattern = r'(export const \w+:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{)'
        match = re.search(alt_pattern, modified)
        if match:
            component_start = match.end()
            insert_text = "\n  const styles = useMemo(() => getStyles(), []);\n"
            modified = modified[:component_start] + insert_text + modified[component_start:]
    
    # Write back
    if modified != content:
        with open(filepath, 'w') as f:
            f.write(modified)
        print(f"Fixed {filepath}")
        return True
    else:
        print(f"No changes made to {filepath}")
        return False

def main():
    screens_dir = "/Users/ogulcanozdemir/fitness-app/src/screens"
    
    files_to_fix = [
        "ActiveWorkoutScreen.tsx",
        "AddProgressPhotoScreen.tsx",
        "AnalyticsDashboardScreen.tsx",
        "CreateExerciseScreen.tsx",
        "CreateWorkoutScreen.tsx",
        "EditExerciseScreen.tsx",
        "EditProfileScreen.tsx",
        "EditWorkoutScreen.tsx",
        "ExerciseDetailScreen.tsx",
        "ExerciseLibraryScreen.tsx",
        "ExerciseProgressScreen.tsx",
        "LogMeasurementScreen.tsx",
        "MeasurementHistoryScreen.tsx",
        "PersonalRecordsScreen.tsx",
        "ProfileScreen.tsx",
        "ProgressPhotosScreen.tsx",
        "StartWorkoutScreen.tsx",
        "StatisticsScreen.tsx",
        "WorkoutCalendarScreen.tsx",
        "WorkoutDetailScreen.tsx",
        "WorkoutListScreen.tsx",
    ]
    
    fixed_count = 0
    for filename in files_to_fix:
        filepath = os.path.join(screens_dir, filename)
        if os.path.exists(filepath):
            if fix_file(filepath):
                fixed_count += 1
        else:
            print(f"File not found: {filepath}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == "__main__":
    main()
