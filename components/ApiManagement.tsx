import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { Navigate } from 'react-router-dom';

declare const SwaggerUIBundle: any;

const ApiManagement: React.FC = () => {
    const { user } = useAuth();

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .swagger-ui .topbar { display: none; }
            body .swagger-ui { background-color: transparent; }
            .swagger-ui .info .title, .swagger-ui .info a { color: #fff; }
            .swagger-ui .info .description, .swagger-ui .info .base-url { color: #fff; }
            .swagger-ui .opblock-tag, .swagger-ui h4, .swagger-ui h3, .swagger-ui h2, .swagger-ui .models h4 { color: #fff; border-bottom-color: rgba(255,255,255,0.2) }
            .swagger-ui .opblock .opblock-summary-description { color: #fff; }
            .swagger-ui .opblock-body .opblock-section-header h4 { color: #fff; }
            .swagger-ui .response-col_status, .swagger-ui .response-col_description { color: #fff }
            .swagger-ui .parameter__name, .swagger-ui .parameter__type { color: #fff }
            .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: #fff; border-bottom-color: rgba(255,255,255,0.2) }
            .swagger-ui .opblock.opblock-post { border-color: #16a34a; background: rgba(22, 163, 74, 0.1); }
            .swagger-ui .opblock.opblock-get { border-color: #0d9488; background: rgba(13, 148, 136, 0.1); }
            .swagger-ui .opblock.opblock-put { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
            .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
            .swagger-ui .opblock-summary-post .opblock-summary-method { background: #16a34a }
            .swagger-ui .opblock-summary-get .opblock-summary-method { background: #0d9488 }
            .swagger-ui .opblock-summary-put .opblock-summary-method { background: #f59e0b }
            .swagger-ui .opblock-summary-delete .opblock-summary-method { background: #ef4444 }
            .swagger-ui .model-title, .swagger-ui .model-toggle, .swagger-ui .model-jump-to-path { color: #fff }
            .swagger-ui .model, .swagger-ui .model .property.primitive { color: #fff }
            .swagger-ui .model-box-control:focus, .swagger-ui .model-box:focus { outline: none; }
            .swagger-ui .opblock-body select { background-color: rgba(255,255,255,0.1); color: #fff; }
            .swagger-ui .opblock-body input, .swagger-ui .opblock-body textarea { background-color: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2); }
            .swagger-ui .btn { border-color: rgba(255,255,255,0.2); }
            .swagger-ui .btn.execute { background-color: #16a34a; color: white; }
            .swagger-ui section.models { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); border-radius: 8px;}
        `;
        document.head.appendChild(style);

        const ui = SwaggerUIBundle({
            url: "/swagger.json",
            dom_id: '#swagger-ui',
            deepLinking: false,
            presets: [
                SwaggerUIBundle.presets.apis,
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
        });

        return () => {
            const swaggerUiContainer = document.getElementById('swagger-ui');
            if (swaggerUiContainer) {
                swaggerUiContainer.innerHTML = '';
            }
            document.head.removeChild(style);
        };
    }, []);

    if (user?.role !== UserRole.Admin) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">API Management</h1>
            <div id="swagger-ui" className="swagger-container"></div>
        </div>
    );
};

export default ApiManagement;