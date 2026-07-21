import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { AppProviders } from './app/providers'
import { router } from './router'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<AppProviders>
		<RouterProvider router={router} />
	</AppProviders>,
)