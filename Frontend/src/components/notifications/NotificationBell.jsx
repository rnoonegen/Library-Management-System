import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { api } from 'services/api';



export default function NotificationBell({ to = '/user/notifications' }) {

  const [count, setCount] = useState(0);



  useEffect(() => {

    let active = true;

    let timer;



    const load = () => {

      api

        .getUnreadNotificationCount()

        .then((res) => { if (active) setCount(res.count ?? 0); })

        .catch(() => { if (active) setCount(0); });

    };



    const start = () => {

      load();

      timer = setInterval(load, 60000);

    };



    const stop = () => clearInterval(timer);



    const onVisibility = () => {

      stop();

      if (document.visibilityState === 'visible') start();

    };



    if (document.visibilityState === 'visible') start();

    document.addEventListener('visibilitychange', onVisibility);



    return () => {

      active = false;

      stop();

      document.removeEventListener('visibilitychange', onVisibility);

    };

  }, []);



  return (
    <Link to={to} className="notification-bell-wrap header-icon-link" aria-label="Notifications">

      <span aria-hidden="true">🔔</span>

      {count > 0 && (

        <span className="notification-badge">{count > 9 ? '9+' : count}</span>

      )}

    </Link>

  );

}


