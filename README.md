# US State Income Tax Explorer Dashboard

# Find The Webpage Link: 

An interactive web application that visualizes state income tax rates across the United States, combined with demographic data including median income, median age, and poverty rates.

## Overview

This dashboard allows users to:
- Calculate state income tax based on gross income, marital status, and dependents
- Compare tax rates across all 50 states
- Visualize data through interactive choropleth maps
- View demographic information alongside tax data
- Sort and analyze state-by-state comparisons in a data table

## Features

### Tax Calculation
- Input gross taxable income
- Select marital status (Married/Single)
- Specify number of dependents (0-10)
- Automatic calculation of state tax brackets and actual tax owed

### Interactive Map Visualization
Four display modes available via map control:
1. **State Tax Rate** - Visualizes effective tax rates by state
2. **Median Income** - Shows median household income distribution
3. **Median Age** - Displays median age demographics
4. **Poverty Rate** - Illustrates poverty rate percentages

### Data Table
Sortable columns including:
- State name
- Tax bracket percentage
- Actual tax percentage
- State tax amount
- Income after taxes
- Median income
- Median age
- Poverty rate

## Technologies Used

### Frontend
- **HTML5** - Structure and layout
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Application logic
- **Bootstrap 5.3** - UI framework and components
- **jQuery 3.6.4** - DOM manipulation and AJAX

### Mapping & GIS
- **ArcGIS API for JavaScript 4.33** - Interactive mapping
- **ArcGIS Feature Services** - Live demographic data

### Libraries
- **Bootstrap Table 1.21.4** - Enhanced data table functionality

## Data Sources

### ArcGIS Services
- **State Boundaries**: USA_States_Generalized_Boundaries
- **Median Income**: ACS_Median_Income_by_Race_and_Age_Selp_Emp_Boundaries
- **Median Age**: ACS_Median_Age_Boundaries
- **Poverty Data**: ACS_Poverty_by_Age_Boundaries

### Tax Data
- Tax brackets and rates from [Tax Foundation](https://taxfoundation.org/publications/state-individual-income-tax-rates-and-brackets/)


## Setup Instructions

1. **Clone or download** the project files
2. Ensure all files are in the correct directory structure
3. Open `index.html` in a modern web browser
4. Wait for data to load (submit button will enable when ready)

## Usage

1. **Enter Income Information**
   - Type your gross taxable income in the input field
   - Select marital status (Married or Single)
   - Choose number of dependents

2. **Submit Calculation**
   - Click the Submit button
   - View results in the data table
   - Explore the interactive map

3. **Change Map Display**
   - Use the dropdown in the top-right corner of the map
   - Select different demographic visualizations
   - Map and legend update automatically

4. **Sort and Analyze**
   - Click column headers to sort data
   - Compare states side-by-side
   - Identify tax-friendly states for your situation

## Key Features Explained

### Dynamic Tax Calculation
The application uses progressive tax brackets for each state, calculating:
- Applicable tax bracket based on income
- Actual tax owed
- Effective tax rate percentage
- Income remaining after state taxes

### Real-time Data Integration
- Loads current demographic data from ArcGIS services
- Matches state geometries with tax data
- Handles data loading asynchronously
- Includes error handling and timeout protection

### Responsive Design
- Split-screen layout (sidebar + map)
- Collapsible navigation for mobile devices
- Responsive table with horizontal scrolling
- Adaptive map controls

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Requires JavaScript enabled
- Modern browser with ES6+ support


## Credits

**Data Sources:**
- Tax Foundation for state tax bracket information
- Esri ArcGIS for demographic data services

**Frameworks & Libraries:**
- Bootstrap by Twitter
- ArcGIS API by Esri
- Bootstrap Table by wenzhixin



---

*Last Updated: 2025*