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
                      fill: isSelected ? '#EA580C' : isHovered ? '#FED7AA' : '#E5E7EB',
                      stroke: '#fff',
                      strokeWidth: 0.75,
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'fill 0.15s ease',
                    },
                    hover: {
                      fill: isSelected ? '#C2410C' : '#FDBA74',
                      stroke: '#fff',
                      strokeWidth: 0.75,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: '#C2410C',
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

      <p className="text-center text-xs text-gray-400 h-4 -mt-1">
        {hovered && !selectedState ? hovered : ''}
      </p>
    </div>
  )
}
