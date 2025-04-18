(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[495],{4722:function(e,a,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/register",function(){return r(6192)}])},6192:function(e,a,r){"use strict";r.r(a),r.d(a,{default:function(){return C}});var n=r(5893),s=r(7294),l=r(7375),o=r(9101),i=r(8070),d=r(2121),t=r(525),c=r(6236),h=r(6720),m=r(1163),u=r(1664),x=r.n(u),p=r(512),Z=r(6310),j=r(6197),g=r(3628);let v=Z.Ry().shape({name:Z.Z_().required("Name is required"),email:Z.Z_().email("Invalid email address").required("Email is required"),password:Z.Z_().min(6,"Password must be at least 6 characters").required("Password is required"),confirmPassword:Z.Z_().oneOf([Z.iH("password")],"Passwords must match").required("Confirm password is required"),role:Z.Z_().oneOf(["donor","ngo"],"Please select a valid role").required("Role is required"),phone:Z.Z_(),address:Z.Z_(),organizationName:Z.Z_().when("role",{is:"ngo",then:e=>e.required("Organization name is required for NGOs")}),organizationDetails:Z.Z_()});function C(){let{register:e}=(0,j.a)(),a=(0,m.useRouter)(),[r,u]=(0,s.useState)(""),[Z,C]=(0,s.useState)(!1),b=a.query.role||"donor",w=(0,p.TA)({initialValues:{name:"",email:"",password:"",confirmPassword:"",role:b,phone:"",address:"",organizationName:"",organizationDetails:""},validationSchema:v,onSubmit:async r=>{try{u(""),C(!0);let n={name:r.name,role:r.role,phone:r.phone,address:r.address,organizationName:r.organizationName,organizationDetails:r.organizationDetails};await e(r.email,r.password,n),a.push("/verify-email")}catch(e){console.error("Registration error:",e),u(e.message||"Failed to register")}finally{C(!1)}}});return(0,n.jsx)(g.Z,{title:"Register - MealMatch",description:"Register for a MealMatch account",children:(0,n.jsx)(l.Z,{className:"py-5",children:(0,n.jsx)(o.Z,{className:"justify-content-center",children:(0,n.jsx)(i.Z,{md:8,children:(0,n.jsx)(d.Z,{className:"shadow-sm border-0",children:(0,n.jsxs)(d.Z.Body,{className:"p-4 p-md-5",children:[(0,n.jsx)("h1",{className:"text-center mb-4 fw-bold",children:"Register"}),r&&(0,n.jsx)(t.Z,{variant:"danger",children:r}),(0,n.jsxs)(c.Z,{onSubmit:w.handleSubmit,children:[(0,n.jsx)(o.Z,{children:(0,n.jsx)(i.Z,{md:12,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"I am a:"}),(0,n.jsxs)("div",{children:[(0,n.jsx)(c.Z.Check,{inline:!0,type:"radio",label:"Food Donor",name:"role",id:"donor",value:"donor",checked:"donor"===w.values.role,onChange:()=>w.setFieldValue("role","donor")}),(0,n.jsx)(c.Z.Check,{inline:!0,type:"radio",label:"NGO / Charity",name:"role",id:"ngo",value:"ngo",checked:"ngo"===w.values.role,onChange:()=>w.setFieldValue("role","ngo")})]})]})})}),(0,n.jsxs)(o.Z,{children:[(0,n.jsx)(i.Z,{md:6,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"Full Name"}),(0,n.jsx)(c.Z.Control,{type:"text",id:"name",name:"name",placeholder:"Enter your name",value:w.values.name,onChange:w.handleChange,onBlur:w.handleBlur,isInvalid:!!(w.touched.name&&w.errors.name)}),(0,n.jsx)(c.Z.Control.Feedback,{type:"invalid",children:w.errors.name})]})}),(0,n.jsx)(i.Z,{md:6,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"Email"}),(0,n.jsx)(c.Z.Control,{type:"email",id:"email",name:"email",placeholder:"Enter your email",value:w.values.email,onChange:w.handleChange,onBlur:w.handleBlur,isInvalid:!!(w.touched.email&&w.errors.email)}),(0,n.jsx)(c.Z.Control.Feedback,{type:"invalid",children:w.errors.email})]})})]}),(0,n.jsxs)(o.Z,{children:[(0,n.jsx)(i.Z,{md:6,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"Password"}),(0,n.jsx)(c.Z.Control,{type:"password",id:"password",name:"password",placeholder:"Create password",value:w.values.password,onChange:w.handleChange,onBlur:w.handleBlur,isInvalid:!!(w.touched.password&&w.errors.password)}),(0,n.jsx)(c.Z.Control.Feedback,{type:"invalid",children:w.errors.password})]})}),(0,n.jsx)(i.Z,{md:6,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"Confirm Password"}),(0,n.jsx)(c.Z.Control,{type:"password",id:"confirmPassword",name:"confirmPassword",placeholder:"Confirm password",value:w.values.confirmPassword,onChange:w.handleChange,onBlur:w.handleBlur,isInvalid:!!(w.touched.confirmPassword&&w.errors.confirmPassword)}),(0,n.jsx)(c.Z.Control.Feedback,{type:"invalid",children:w.errors.confirmPassword})]})})]}),(0,n.jsxs)(o.Z,{children:[(0,n.jsx)(i.Z,{md:6,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"Phone Number"}),(0,n.jsx)(c.Z.Control,{type:"tel",id:"phone",name:"phone",placeholder:"Enter phone number",value:w.values.phone,onChange:w.handleChange,onBlur:w.handleBlur})]})}),(0,n.jsx)(i.Z,{md:6,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"Address"}),(0,n.jsx)(c.Z.Control,{type:"text",id:"address",name:"address",placeholder:"Enter your address",value:w.values.address,onChange:w.handleChange,onBlur:w.handleBlur})]})})]}),"ngo"===w.values.role&&(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(o.Z,{children:(0,n.jsx)(i.Z,{md:12,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"Organization Name"}),(0,n.jsx)(c.Z.Control,{type:"text",id:"organizationName",name:"organizationName",placeholder:"Enter organization name",value:w.values.organizationName,onChange:w.handleChange,onBlur:w.handleBlur,isInvalid:!!(w.touched.organizationName&&w.errors.organizationName)}),(0,n.jsx)(c.Z.Control.Feedback,{type:"invalid",children:w.errors.organizationName})]})})}),(0,n.jsx)(o.Z,{children:(0,n.jsx)(i.Z,{md:12,className:"mb-3",children:(0,n.jsxs)(c.Z.Group,{children:[(0,n.jsx)(c.Z.Label,{children:"Organization Details"}),(0,n.jsx)(c.Z.Control,{as:"textarea",id:"organizationDetails",name:"organizationDetails",placeholder:"Brief description of your organization",value:w.values.organizationDetails,onChange:w.handleChange,onBlur:w.handleBlur,style:{height:"100px"}})]})})})]}),(0,n.jsx)(h.Z,{variant:"success",type:"submit",className:"w-100 py-2 mt-3",disabled:Z,children:Z?"Creating Account...":"Register"})]}),(0,n.jsx)("div",{className:"mt-4 text-center",children:(0,n.jsxs)("p",{className:"mb-0",children:["Already have an account?"," ",(0,n.jsx)(x(),{href:"/login",className:"text-success",children:"Login here"})]})})]})})})})})})}}},function(e){e.O(0,[445,999,330,728,633,628,888,774,179],function(){return e(e.s=4722)}),_N_E=e.O()}]);