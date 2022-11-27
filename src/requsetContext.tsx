import React from 'react';
import { merge } from 'lodash';


export type RequestContextProps = {
  projectId?: string;
  tenantId?: string;
  systemId?: string;
  actionId?: string;
  actionCode?: string;
  pgId?: string;
  headers?: HeadersInit;
  params?: object | URLSearchParams;
};

const context = React.createContext<RequestContextProps>({});

const RequestProvider = context.Provider;

export const useRequestContext = () => React.useContext(context) || {};

export default ({
  children,
  ...options
}: React.PropsWithChildren<RequestContextProps>) => {
  const v = useRequestContext();

  return React.useMemo(
    () => (
      <RequestProvider value={merge({}, v, options)}>
        {children}
      </RequestProvider>
    ),
    [options, v],
  );
};

// export const useRequest = () => {
//   const { projectId, tenantId, systemId, actionId, actionCode, pgId, ...options } =
//     useRequestContext();

//   const ref = React.useRef(
//     createReqeust((req) =>
//       req.zebrasOptions(
//         merge({}, options, {
//           headers: pickBy(
//             {
//               _LoginProjectId: projectId,
//               _TenantId: tenantId,
//               _SysId: systemId,
//               _ActionId: actionId,
//               _ActionCode: actionCode,
//               _PgId: pgId
//             },
//             identity
//           ),
//         })
//       )
//     )
//   );

//   return ref.current;
// };
