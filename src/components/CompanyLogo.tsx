import { useState } from 'react';
export function CompanyLogo({name,logoUrl,className=''}:{name:string;logoUrl?:string;className?:string}) {
 const [logoDevFailed,setLogoDevFailed]=useState(false);const [seedFailed,setSeedFailed]=useState(false);const key=import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY;
 const domain=(()=>{try{return new URL(logoUrl||'').hostname.replace(/^www\./,'')}catch{return ''}})();
 const logoDevSrc=key&&domain&&!logoDevFailed?`https://img.logo.dev/${domain}?token=${key}`:undefined;
 const src=logoDevSrc||(!seedFailed?logoUrl:undefined);
 return <div className={`company-logo ${className}`}>{src?<img src={src} alt={`${name} logo`} onError={()=>{if(logoDevSrc)setLogoDevFailed(true);else setSeedFailed(true)}}/>:<span>{name.trim().slice(0,1).toUpperCase()||'C'}</span>}</div>;
}
