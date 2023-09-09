"use strict";

/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2023 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/* global globalRootUrl, globalTranslate, Form, PbxApi */

/**
 * ModuleLdapSyncModify
 *
 * This object handles the functionality of synchronizing LDAP users and
 * other related features.
 */
var ModuleLdapSyncIndex = {
  $autoSyncStatuses: $('.checkbox.server-sync-status'),
  initialize: function initialize() {
    // Enable/disable server checkbox handlers
    ModuleLdapSyncIndex.$autoSyncStatuses.checkbox({
      onChecked: function onChecked() {
        var id = $(this).closest('tr').attr('id');
        $.api({
          url: "".concat(globalRootUrl, "module-ldap-sync/module-ldap-sync/enable/{id}"),
          on: 'now',
          urlData: {
            id: id
          }
        });
      },
      onUnchecked: function onUnchecked() {
        var id = $(this).closest('tr').attr('id');
        $.api({
          url: "".concat(globalRootUrl, "module-ldap-sync/module-ldap-sync/disable/{id}"),
          on: 'now',
          urlData: {
            id: id
          }
        });
      }
    });
  }
};
$(document).ready(function () {
  ModuleLdapSyncIndex.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLWluZGV4LmpzIl0sIm5hbWVzIjpbIk1vZHVsZUxkYXBTeW5jSW5kZXgiLCIkYXV0b1N5bmNTdGF0dXNlcyIsIiQiLCJpbml0aWFsaXplIiwiY2hlY2tib3giLCJvbkNoZWNrZWQiLCJpZCIsImNsb3Nlc3QiLCJhdHRyIiwiYXBpIiwidXJsIiwiZ2xvYmFsUm9vdFVybCIsIm9uIiwidXJsRGF0YSIsIm9uVW5jaGVja2VkIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLG1CQUFtQixHQUFHO0FBQ3hCQyxFQUFBQSxpQkFBaUIsRUFBQ0MsQ0FBQyxDQUFDLDhCQUFELENBREs7QUFFeEJDLEVBQUFBLFVBRndCLHdCQUVaO0FBQ1I7QUFDQUgsSUFBQUEsbUJBQW1CLENBQUNDLGlCQUFwQixDQUNLRyxRQURMLENBQ2M7QUFDTkMsTUFBQUEsU0FETSx1QkFDTTtBQUNSLFlBQU1DLEVBQUUsR0FBR0osQ0FBQyxDQUFDLElBQUQsQ0FBRCxDQUFRSyxPQUFSLENBQWdCLElBQWhCLEVBQXNCQyxJQUF0QixDQUEyQixJQUEzQixDQUFYO0FBQ0FOLFFBQUFBLENBQUMsQ0FBQ08sR0FBRixDQUFNO0FBQ0ZDLFVBQUFBLEdBQUcsWUFBS0MsYUFBTCxrREFERDtBQUVGQyxVQUFBQSxFQUFFLEVBQUUsS0FGRjtBQUdGQyxVQUFBQSxPQUFPLEVBQUU7QUFDTFAsWUFBQUEsRUFBRSxFQUFGQTtBQURLO0FBSFAsU0FBTjtBQU9ILE9BVks7QUFXTlEsTUFBQUEsV0FYTSx5QkFXUTtBQUNWLFlBQU1SLEVBQUUsR0FBR0osQ0FBQyxDQUFDLElBQUQsQ0FBRCxDQUFRSyxPQUFSLENBQWdCLElBQWhCLEVBQXNCQyxJQUF0QixDQUEyQixJQUEzQixDQUFYO0FBQ0FOLFFBQUFBLENBQUMsQ0FBQ08sR0FBRixDQUFNO0FBQ0ZDLFVBQUFBLEdBQUcsWUFBS0MsYUFBTCxtREFERDtBQUVGQyxVQUFBQSxFQUFFLEVBQUUsS0FGRjtBQUdGQyxVQUFBQSxPQUFPLEVBQUU7QUFDTFAsWUFBQUEsRUFBRSxFQUFGQTtBQURLO0FBSFAsU0FBTjtBQU9IO0FBcEJLLEtBRGQ7QUF1Qkg7QUEzQnVCLENBQTVCO0FBOEJBSixDQUFDLENBQUNhLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDcEJoQixFQUFBQSxtQkFBbUIsQ0FBQ0csVUFBcEI7QUFDSCxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIGdsb2JhbFRyYW5zbGF0ZSwgRm9ybSwgUGJ4QXBpICovXG5cbi8qKlxuICogTW9kdWxlTGRhcFN5bmNNb2RpZnlcbiAqXG4gKiBUaGlzIG9iamVjdCBoYW5kbGVzIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHN5bmNocm9uaXppbmcgTERBUCB1c2VycyBhbmRcbiAqIG90aGVyIHJlbGF0ZWQgZmVhdHVyZXMuXG4gKi9cbmNvbnN0IE1vZHVsZUxkYXBTeW5jSW5kZXggPSB7XG4gICAgJGF1dG9TeW5jU3RhdHVzZXM6JCgnLmNoZWNrYm94LnNlcnZlci1zeW5jLXN0YXR1cycpLFxuICAgIGluaXRpYWxpemUoKXtcbiAgICAgICAgLy8gRW5hYmxlL2Rpc2FibGUgc2VydmVyIGNoZWNrYm94IGhhbmRsZXJzXG4gICAgICAgIE1vZHVsZUxkYXBTeW5jSW5kZXguJGF1dG9TeW5jU3RhdHVzZXNcbiAgICAgICAgICAgIC5jaGVja2JveCh7XG4gICAgICAgICAgICAgICAgb25DaGVja2VkKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9ICQodGhpcykuY2xvc2VzdCgndHInKS5hdHRyKCdpZCcpO1xuICAgICAgICAgICAgICAgICAgICAkLmFwaSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLWxkYXAtc3luYy9tb2R1bGUtbGRhcC1zeW5jL2VuYWJsZS97aWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uOiAnbm93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VbmNoZWNrZWQoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gJCh0aGlzKS5jbG9zZXN0KCd0cicpLmF0dHIoJ2lkJyk7XG4gICAgICAgICAgICAgICAgICAgICQuYXBpKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtbGRhcC1zeW5jL21vZHVsZS1sZGFwLXN5bmMvZGlzYWJsZS97aWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uOiAnbm93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgICBNb2R1bGVMZGFwU3luY0luZGV4LmluaXRpYWxpemUoKTtcbn0pOyJdfQ==