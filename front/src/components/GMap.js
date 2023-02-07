import { GoogleMap, Marker } from "@react-google-maps/api";
function GMap({ markerPosition, onClick, draggable }) {
  return (
    <>
      <GoogleMap
        mapContainerStyle={{ width: "250px", height: "250px" }}
        center={{
          lat: markerPosition[0],
          lng: markerPosition[1],
        }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
        zoom={5}
        onClick={onClick || null}
      >
        {/* Child components, such as markers, info windows, etc. */}

        <Marker
          position={{
            lat: markerPosition[0],
            lng: markerPosition[1],
          }}
          draggable={draggable ? true : false}
          onPositionChanged={(e) => {}}
        />
      </GoogleMap>
    </>
  );
}
export default GMap;
