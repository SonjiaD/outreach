import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

export default function USMap({ selectedState, onSelect }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="w-full">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.name
              const isSelected = selectedState === name
              const isHovered = hovered === name

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelect(name)}
                  style={{
                    default: {
                      fill: isSelected ? '#2563EB' : isHovered ? '#BFDBFE' : '#E5E7EB',
                      stroke: '#fff',
                      strokeWidth: 0.75,
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'fill 0.15s ease',
                    },
                    hover: {
                      fill: isSelected ? '#1D4ED8' : '#93C5FD',
                      stroke: '#fff',
                      strokeWidth: 0.75,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: '#1D4ED8',
                      stroke: '#fff',
                      strokeWidth: 0.75,
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {hovered && !selectedState && (
        <p className="text-center text-xs text-gray-500 -mt-2">{hovered}</p>
      )}
    </div>
  )
}
