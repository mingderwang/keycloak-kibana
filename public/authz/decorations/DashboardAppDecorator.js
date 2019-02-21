import Roles from '../constants/Roles';
import Permissions from "../constants/Permissions";

/**
 * This replaces the controller of the original dashboardApp directive
 * so that it is possible to hide write controls depending on permissions
 * assigned for each dashboard.
 *
 * @see https://github.com/elastic/kibana/blob/v6.4.2/src/core_plugins/kibana/public/dashboard/dashboard_app.js#L79
 */
export default function DashboardAppDecorator($delegate) {
    return $delegate.map(del => {
        const baseControler = del.controller;
        function newController($scope, $rootScope, $route, $routeParams, $location, getAppState, dashboardConfig, localStorage, principalProvider) {
            const dashboard = $route.current.locals.dash;
            const principal = principalProvider.getPrincipal();
            const newDashboardConfig = {
                getHideWriteControls: () => {
                    const canManageDashboards = principal.scope.includes(Roles.MANAGE_DASHBOARDS);
                    if (!canManageDashboards) {
                        return true;
                    }
                    return dashboard.permissions &&
                        !dashboard.permissions.includes(Permissions.EDIT) &&
                        !dashboard.permissions.includes(Permissions.MANAGE)
                }
            };
            return baseControler.bind(this).call(del, $scope, $rootScope, $route, $routeParams, $location, getAppState, newDashboardConfig, localStorage);
        }
        del.controller = newController;
        return del;
    });
}