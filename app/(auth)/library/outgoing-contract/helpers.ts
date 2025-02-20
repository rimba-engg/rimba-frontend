import { ghgData, distanceData } from './constants';

export const getGHGValue = (
    portOfLoading: string,
    portOfDischarge: string,
    route: string
  ) => {
    const loadingPorts = Object.keys(ghgData);
    const dischargePorts = loadingPorts.flatMap((p) => Object.keys(ghgData[p]));
    const lowerLoading = portOfLoading.toLowerCase();
    const lowerDischarge = portOfDischarge.toLowerCase();
    const matchedLoading = loadingPorts.find((port) =>
      lowerLoading.includes(port.toLowerCase())
    );
    const matchedDischarge = dischargePorts.find((port) =>
      lowerDischarge.includes(port.toLowerCase())
    );
    if (
      matchedLoading &&
      matchedDischarge &&
      ghgData[matchedLoading][matchedDischarge]
    ) {
      return ghgData[matchedLoading][matchedDischarge][route] || 0;
    }
    return 0;
  };
  
export const getDistance = (
    portOfLoading: string,
    portOfDischarge: string,
    route: string
  ) => {
    const loadingPorts = Object.keys(distanceData);
    const dischargePorts = loadingPorts.flatMap((p) => Object.keys(distanceData[p]));
    const lowerLoading = portOfLoading.toLowerCase();
    const lowerDischarge = portOfDischarge.toLowerCase();
    const matchedLoading = loadingPorts.find((port) =>
      lowerLoading.includes(port.toLowerCase())
    );
    const matchedDischarge = dischargePorts.find((port) =>
      lowerDischarge.includes(port.toLowerCase())
    );
    if (
      matchedLoading &&
      matchedDischarge &&
      distanceData[matchedLoading][matchedDischarge]
    ) {
      return distanceData[matchedLoading][matchedDischarge][route] || 0;
    }
    return 0;
  };
  