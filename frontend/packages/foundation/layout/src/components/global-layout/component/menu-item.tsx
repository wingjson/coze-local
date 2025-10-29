/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NavLink, useLocation } from 'react-router-dom';
import { type FC } from 'react';

import classNames from 'classnames';

import { reportNavClick } from '../utils';
import { type LayoutMenuItem } from '../types';

const menuStyle = classNames(
  'w-[200px] h-[50px]',
  'flex items-center justify-start',
  'rounded-[6px]',
  'transition-all',
  'hover:coz-mg-primary-hovered',
  'pl-2'
);

export const GLobalLayoutMenuItem: FC<LayoutMenuItem> = ({
  title,
  icon,
  activeIcon,
  path,
  dataTestId,
}) => {
  const location = useLocation();

  let isActive = false;
  let newPath = '';
  // If path is an array, take the first matching path
  if (Array.isArray(path)) {
    isActive = path.some(p => location.pathname.startsWith(p));
    newPath = path.find(p => location.pathname.startsWith(p)) || path[0];
  } else {
    isActive = location.pathname.startsWith(path);
    newPath = path;
  }

  // cp-disable-next-line
  const isLink = newPath.startsWith('https://');

  const navId = `primary-menu-${
    newPath.startsWith('/') ? newPath.slice(1) : newPath
  }`;
  return (
    <NavLink
      to={newPath}
      target={isLink ? '_blank' : undefined}
      className="no-underline"
      onClick={() => {
        reportNavClick(title);
      }}
      data-testid={dataTestId}
    >
      <div
        className={classNames(
          menuStyle,
          isActive
            ? 'coz-mg-primary coz-fg-plus'
            : 'coz-bg-max coz-fg-secondary',
        )}
        id={navId}
      >
        <div className="text-[20px] leading-none flex items-center justify-center">
          {isActive ? activeIcon : icon}
        </div>
        <div className="font-[500] ml-4 flex items-center overflow-hidden leading-none overflow-hidden w-full">
          <span className="text-[16px] whitespace-nowrap">
            {title}
          </span>
        </div>
      </div>
    </NavLink>
  );
};
