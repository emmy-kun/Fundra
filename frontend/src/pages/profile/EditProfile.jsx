import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function EditProfile(){
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({first_name:'', last_name:'', email:'', phone_number:''});
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    (async ()=>{
      try{
        const { getProfile } = await import('../../services/authService');
        const res = await getProfile();
        setUser(res.data);
        setForm({ first_name: res.data.first_name || '', last_name: res.data.last_name || '', email: res.data.email || '', phone_number: res.data.phone_number || '' });
        setProfileImage(res.data.profile_image);
      }catch(e){ }
    })();
  },[]);

  const handleImage = (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    setProfileImage(URL.createObjectURL(f));
    setForm((s)=>({ ...s, _imageFile: f }));
  }

  const handleSave = async () => {
    setSaving(true);
    try{
      const { updateProfile } = await import('../../services/authService');
      let payload;
      if(form._imageFile){
        payload = new FormData();
        payload.append('first_name', form.first_name);
        payload.append('last_name', form.last_name);
        payload.append('email', form.email);
        payload.append('phone_number', form.phone_number);
        payload.append('profile_image', form._imageFile);
      } else {
        payload = { first_name: form.first_name, last_name: form.last_name, email: form.email, phone_number: form.phone_number };
      }
      await updateProfile(payload);
      navigate('/profile');
    }catch(err){
      alert('Failed to save');
    }finally{setSaving(false)}
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={()=>navigate("/")} className="h-11 w-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Profile Image</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                {profileImage ? <img src={profileImage} alt="avatar" className="h-full w-full object-cover" /> : null}
              </div>
              <input type="file" accept="image/*" onChange={handleImage} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">First Name</label>
              <input value={form.first_name} onChange={(e)=>setForm({...form, first_name: e.target.value})} className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name</label>
              <input value={form.last_name} onChange={(e)=>setForm({...form, last_name: e.target.value})} className="w-full rounded border px-3 py-2" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="w-full rounded border px-3 py-2" />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <input value={form.phone_number} onChange={(e)=>setForm({...form, phone_number: e.target.value})} className="w-full rounded border px-3 py-2" />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button onClick={()=>navigate('/profile')} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">{saving? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
