import React from 'react';
import {
  User, BookOpen, Heart, Users, FileText, Home, Tractor, Camera, AlertCircle, Trash2, Plus, X, Lock, Trophy
} from 'lucide-react';
import { SectionCard, Field, CheckItem, RadioItem, PhotoUpload, SignatureField } from './FormHelpers';

export const StudentInfoSection = React.memo(({
  form,
  handleChange,
  fetchExistingVerification,
  isReadOnly,
  isAdmin,
  selectCls,
  inputCls
}) => {
  return (
    <SectionCard
      icon={User}
      title="Student Information"
      color="indigo"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <Field label="Scholarship Type" required>
          <select name="scholarshipType" value={form.scholarshipType} onChange={handleChange} className={selectCls}>
            <option value="">Select Type</option>
            <option value="SNS">SNS – Singaji Nivedita Scholarship</option>
            <option value="SVS">SVS – Singaji Vivekananda Scholarship</option>
          </select>
        </Field>
        <Field label="Student ID (Roll Number)" required>
          <input
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            onBlur={(e) => fetchExistingVerification(e.target.value)}
            placeholder="e.g. 21001"
            className={inputCls}
          />
        </Field>
        <Field label="Student Name" required>
          <input name="studentName" value={form.studentName} onChange={handleChange} placeholder="Full name" className={inputCls} />
        </Field>
        <Field label="Mobile Number" required>
          <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit number" className={inputCls} type="tel" />
        </Field>
        <Field label="Verification Date" required>
          <input name="verificationDate" value={form.verificationDate} onChange={handleChange} type="date" className={inputCls} />
        </Field>
        <Field label="Verifier Name" required>
          <div className="relative">
            <input
              name="verifierName"
              value={form.verifierName}
              readOnly
              placeholder="Auto-filled from login"
              className={`${inputCls} pr-9 bg-slate-100 cursor-not-allowed text-slate-600`}
              title="Auto-filled from your logged-in account"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" title="Read-only">
              <Lock size={16} strokeWidth={1.5} />
            </span>
          </div>
        </Field>
      </div>
    </SectionCard>
  );
});

export const AcademicSection = React.memo(({ form, handleChange, isReadOnly, inputCls }) => {
  return (
    <SectionCard
      icon={BookOpen}
      title="Academic Details"
      color="sky"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {[
          { label: '10th Percentage (Max 100)', name: 'marks10', max: 100 },
          { label: '11th Percentage (Max 100)', name: 'marks11', max: 100 },
          { label: 'College Exam Marks (Max 50)', name: 'collegeExamMarks', max: 50 },
          { label: 'Attendance in 12th (Max 100 %)', name: 'attendance12', max: 100 },
        ].map(f => (
          <Field key={f.name} label={f.label}>
            <input name={f.name} value={form[f.name]} onChange={handleChange} type="number" min="0" max={f.max} placeholder="0" className={inputCls} />
          </Field>
        ))}
      </div>
    </SectionCard>
  );
});

export const PersonalSection = React.memo(({
  form,
  handleChange,
  isReadOnly,
  inputCls,
  selectCls,
  textareaCls,
  setForm
}) => {
  return (
    <SectionCard
      icon={User}
      title="Personal Information"
      color="indigo"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <Field label="Father Name" required>
          <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father's full name" className={inputCls} />
        </Field>
        <Field label="12th School Name">
          <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="School name" className={inputCls} />
        </Field>
        <Field label="12th Class Fees (₹)">
          <input name="classFees12" value={form.classFees12} onChange={handleChange} type="number" min="0" placeholder="Annual fees" className={inputCls} />
        </Field>
        <Field label="12th Stream">
          <select
            name="subject12"
            value={form.subject12}
            onChange={handleChange}
            className={`${selectCls} ${form.subject12 === 'Other' ? 'focus:ring-0 focus:border-slate-200 opacity-70' : ''}`}
          >
            <option value="">Select Stream</option>
            <option value="Maths">Maths</option>
            <option value="Commerce">Commerce</option>
            <option value="Biology">Biology</option>
            <option value="Arts">Arts</option>
            <option value="Science">Science</option>
            <option value="Other">Other</option>
          </select>
          {form.subject12 === 'Other' && (
            <input
              name="subject12Custom"
              value={form.subject12Custom || ''}
              onChange={handleChange}
              placeholder="Enter your stream"
              className={`${inputCls} mt-2 border-orange-400 ring-2 ring-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]`}
            />
          )}
        </Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Full Address" required>
            <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House No., Street, Area..." className={textareaCls} />
          </Field>
        </div>
        <Field label="Village">
          <input name="village" value={form.village} onChange={handleChange} placeholder="Village name" className={inputCls} />
        </Field>
        <Field label="Tehsil">
          <input name="tehsil" value={form.tehsil} onChange={handleChange} placeholder="Tehsil" className={inputCls} />
        </Field>
        <Field label="District">
          <input name="district" value={form.district} onChange={handleChange} placeholder="District" className={inputCls} />
        </Field>
        <Field label="Pincode">
          <input
            name="pincode"
            value={form.pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setForm(prev => ({ ...prev, pincode: val }));
            }}
            placeholder="6-digit pincode"
            type="text"
            inputMode="numeric"
            className={inputCls}
          />
        </Field>
        <Field label="Track Name">
          <select
            name="track"
            value={form.track}
            onChange={handleChange}
            className={`${selectCls} ${form.track === 'Other' ? 'focus:ring-0 focus:border-slate-200 opacity-70' : ''}`}
          >
            <option value="">Select Track</option>
            <option value="Khategaon">Khategaon</option>
            <option value="Kannod">Kannod</option>
            <option value="Satwas">Satwas</option>
            <option value="Gopalpur">Gopalpur</option>
            <option value="Narsullaganj">Narsullaganj</option>
            <option value="Nemawar">Nemawar</option>
            <option value="Harda">Harda</option>
            <option value="Timarni">Timarni</option>
            <option value="Narmadapuram">Narmadapuram</option>
            <option value="Other">Other</option>
          </select>
          {form.track === 'Other' && (
            <input
              name="trackCustom"
              value={form.trackCustom || ''}
              onChange={handleChange}
              placeholder="Enter track name"
              className={`${inputCls} mt-2 border-orange-400 ring-2 ring-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]`}
            />
          )}
        </Field>
        <Field label="Future Goal">
          <input name="futureGoal" value={form.futureGoal} onChange={handleChange} placeholder="Career goal" className={inputCls} />
        </Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            <div className="flex items-center gap-1.5"><Trophy size={14} strokeWidth={1.5} className="text-amber-500" /> Any Special Achievements / Awards?</div>
          </label>
          <div className="flex gap-4 sm:gap-6 mb-3">
            <RadioItem name="hasAchievements" value="yes" label="Yes" form={form} setForm={setForm} />
            <RadioItem name="hasAchievements" value="no" label="No" form={form} setForm={setForm} />
          </div>
          {form.hasAchievements === 'yes' && (
            <Field label="Describe Achievements">
              <textarea
                name="achievements"
                value={form.achievements}
                onChange={handleChange}
                rows={2}
                placeholder="E.g. Sports, Academic awards..."
                className={textareaCls}
              />
            </Field>
          )}
        </div>
      </div>
    </SectionCard>
  );
});

export const HealthSection = React.memo(({ form, handleChange, isReadOnly, inputCls, setForm }) => {
  return (
    <SectionCard
      icon={Heart}
      title="Health Information"
      color="rose"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <Field label="Do you have any illness?">
          <div className="flex gap-4 sm:gap-6 pt-1">
            <RadioItem name="hasIllness" value="yes" label="Yes" form={form} setForm={setForm} />
            <RadioItem name="hasIllness" value="no" label="No" form={form} setForm={setForm} />
          </div>
        </Field>
        {form.hasIllness === 'yes' && (
          <>
            <Field label="Illness Name">
              <input name="illnessName" value={form.illnessName} onChange={handleChange} placeholder="Name of illness" className={inputCls} />
            </Field>
            <Field label="Symptoms">
              <input name="symptoms" value={form.symptoms} onChange={handleChange} placeholder="Describe symptoms" className={inputCls} />
            </Field>
          </>
        )}
      </div>
    </SectionCard>
  );
});

export const FamilySection = React.memo(({ familyMembers, updateMember, addFamilyMember, removeFamilyMember, isReadOnly }) => {
  return (
    <SectionCard
      icon={Users}
      title="Family Members Details"
      color="emerald"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="overflow-x-auto rounded-xl border border-slate-100 thin-scrollbar">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-tight text-[9px] sm:text-[10px] border-b border-slate-100">
              {['Name', 'Relation', 'Occupation', 'Qualification', 'Income (₹)', 'Mobile', ''].map(h => (
                <th key={h} className="px-3 py-3 sm:px-4 sm:py-4 text-left font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {familyMembers.map((m, i) => (
              <tr key={i} className="border-t border-slate-100/60 hover:bg-slate-50/50 transition-colors">
                <td className="px-2 py-2 sm:px-3 sm:py-3">
                  <input value={m.name} onChange={e => updateMember(i, 'name', e.target.value)}
                    placeholder="Name"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-100 bg-white text-[12px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all font-medium" />
                </td>
                <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                  {['Father', 'Mother', 'Sister', 'Brother', ''].includes(m.relation) ? (
                    <select value={m.relation} onChange={e => updateMember(i, 'relation', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-100 bg-white text-[12px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 cursor-pointer font-medium transition-all">
                      <option value="">Select</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Sister">Sister</option>
                      <option value="Brother">Brother</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="relative group">
                      <input
                        value={m.relation === 'Other' ? '' : m.relation}
                        onChange={e => updateMember(i, 'relation', e.target.value)}
                        autoFocus
                        placeholder="Relation"
                        className="w-full pl-2 pr-6 py-1.5 rounded-lg border border-orange-200 bg-white text-[12px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/30 font-bold text-orange-600 transition-all"
                      />
                      <button
                        onClick={() => updateMember(i, 'relation', '')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                  {['Labour', 'Farmer', 'Job', 'Student', ''].includes(m.occupation) ? (
                    <select value={m.occupation} onChange={e => updateMember(i, 'occupation', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-100 bg-white text-[12px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 cursor-pointer font-medium transition-all">
                      <option value="">Select</option>
                      <option value="Labour">Labour</option>
                      <option value="Farmer">Farmer</option>
                      <option value="Job">Job</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="relative group">
                      <input
                        value={m.occupation === 'Other' ? '' : m.occupation}
                        onChange={e => updateMember(i, 'occupation', e.target.value)}
                        autoFocus
                        placeholder="Occupation"
                        className="w-full pl-2 pr-6 py-1.5 rounded-lg border border-orange-200 bg-white text-[12px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/30 font-bold text-orange-600 transition-all"
                      />
                      <button
                        onClick={() => updateMember(i, 'occupation', '')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3">
                  <input value={m.educationLevel || ''} onChange={e => updateMember(i, 'educationLevel', e.target.value)}
                    placeholder="Qualification"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-100 bg-white text-[12px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all font-medium" />
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3">
                  <input value={m.income} onChange={e => updateMember(i, 'income', e.target.value)}
                    type="number" placeholder="Income"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-[12px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all" />
                </td>
                <td className="px-2 py-2 sm:px-3 sm:py-3">
                  <input value={m.mobile} onChange={e => updateMember(i, 'mobile', e.target.value)}
                    placeholder="Mobile"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-[12px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all" />
                </td>
                <td className="px-1.5 py-1.5">
                  <button onClick={() => removeFamilyMember(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addFamilyMember}
        className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 bg-brand-50/50 hover:bg-brand-50 px-4 py-2 rounded-xl transition-all border border-brand-100">
        <Plus size={16} /> Add Family Member
      </button>
    </SectionCard>
  );
});

export const IncomeSection = React.memo(({ form, handleChange, isReadOnly, inputCls, textareaCls, setForm }) => {
  return (
    <SectionCard
      icon={FileText}
      title="Family Income"
      color="orange"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <Field label="Total Annual Family Income (₹)" required>
          <input name="totalAnnualIncome" value={form.totalAnnualIncome} onChange={handleChange} type="number" min="0" placeholder="e.g. 150000" className={inputCls} />
        </Field>
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">Income Sources</label>
          <div className="grid grid-cols-2 gap-2">
            {['Farming', 'Labor Work', 'Job', 'Business', 'Government Pension', 'Other'].map(src => (
              <CheckItem key={src} name="incomeSources" value={src} label={src} checked={(form.incomeSources || []).includes(src)} onChange={(name, val) => {
                const list = form.incomeSources ? [...form.incomeSources] : [];
                const newValue = list.includes(val) ? list.filter(v => v !== val) : [...list, val];
                handleChange({ target: { name, value: newValue } });
              }} />
            ))}
          </div>
        </div>
        {(form.incomeSources || []).includes('Other') && (
          <Field label="Specify Other Income Source">
            <input name="incomeOther" value={form.incomeOther} onChange={handleChange} placeholder="Describe" className={inputCls} />
          </Field>
        )}
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Challenges Faced by Family">
            <textarea name="familyChallenges" value={form.familyChallenges} onChange={handleChange} rows={3} placeholder="Describe any major challenges..." className={textareaCls} />
          </Field>
        </div>
      </div>
    </SectionCard>
  );
});

export const HousingSection = React.memo(({ form, handleChange, isReadOnly, inputCls, selectCls, setForm }) => {
  return (
    <SectionCard
      icon={Home}
      title="Housing Condition"
      color="amber"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <div>
          <label className="text-[11px] sm:text-sm font-semibold text-slate-700 block mb-2">Type of House</label>
          <div className="flex flex-wrap gap-2.5 sm:gap-4">
            {['Pucca', 'Kaccha', 'Semi Pucca'].map(t => <RadioItem key={t} name="houseType" value={t} label={t} checked={form.houseType === t} onChange={(name, val) => handleChange({ target: { name, value: val } })} />)}
          </div>
        </div>
        <Field label="Number of Rooms">
          <input name="numRooms" value={form.numRooms} onChange={handleChange} type="number" min="1" placeholder="e.g. 3" className={inputCls} />
        </Field>
        <div>
          <label className="text-[11px] sm:text-sm font-semibold text-slate-700 block mb-2">Who Built the House?</label>
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 mb-3">
            <RadioItem name="houseBuilder" value="Self" label="Self" checked={form.houseBuilder === 'Self'} onChange={(name, val) => handleChange({ target: { name, value: val } })} />
            <RadioItem name="houseBuilder" value="Government Scheme" label="Government Scheme" checked={form.houseBuilder === 'Government Scheme'} onChange={(name, val) => handleChange({ target: { name, value: val } })} />
            <RadioItem name="houseBuilder" value="Loan" label="Loan" checked={form.houseBuilder === 'Loan'} onChange={(name, val) => handleChange({ target: { name, value: val } })} />
          </div>
          {form.houseBuilder === 'Government Scheme' && (
            <div className="mt-3">
              <Field label="Scheme Name">
                {['PM Awas Yojana', ''].includes(form.houseSchemeName) ? (
                  <select
                    name="houseSchemeName"
                    value={form.houseSchemeName}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select Scheme</option>
                    <option value="PM Awas Yojana">PM Awas Yojana</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="relative group">
                    <input
                      name="houseSchemeName"
                      value={form.houseSchemeName === 'Other' ? '' : form.houseSchemeName}
                      onChange={handleChange}
                      autoFocus
                      placeholder="Enter Scheme Name"
                      className={`${inputCls} pr-8 border-orange-400 font-semibold text-orange-700 shadow-[0_0_15px_rgba(251,146,60,0.1)]`}
                    />
                    <button
                      onClick={() => handleChange({ target: { name: 'houseSchemeName', value: '' } })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                      title="Back to options"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </Field>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
});

export const ResourcesSection = React.memo(({ form, handleChange, isReadOnly, inputCls, setForm }) => {
  return (
    <SectionCard
      icon={Home}
      title="Household Resources & Vehicles"
      color="blue"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
        <div>
          <label className="text-[11px] sm:text-sm font-semibold text-slate-700 block mb-2">Appliances</label>
          <div className="flex flex-col gap-2">
            {['Refrigerator', 'Washing Machine', 'Air Conditioner'].map(a => (
              <CheckItem key={a} name="appliances" value={a} label={a} checked={(form.appliances || []).includes(a)} onChange={(name, val) => {
                const list = form.appliances ? [...form.appliances] : [];
                const newValue = list.includes(val) ? list.filter(v => v !== val) : [...list, val];
                handleChange({ target: { name, value: newValue } });
              }} />
            ))}
          </div>
        </div>
        <div>
          <Field label="Number of Vehicles">
            <input name="numVehicles" value={form.numVehicles} onChange={handleChange} type="number" min="0" placeholder="0" className={inputCls} />
          </Field>
          <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mt-2 mb-1.5">Vehicle Types</label>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {['Bicycle', 'Bike', 'Car', 'Tractor', 'Other'].map(v => (
              <CheckItem key={v} name="vehicleTypes" value={v} label={v} checked={(form.vehicleTypes || []).includes(v)} onChange={(name, val) => {
                const list = form.vehicleTypes ? [...form.vehicleTypes] : [];
                const newValue = list.includes(val) ? list.filter(v => v !== val) : [...list, val];
                handleChange({ target: { name, value: newValue } });
              }} />
            ))}
          </div>
          {(form.vehicleTypes || []).includes('Other') && (
            <div className="mt-3 animate-fade-in">
              <Field label="Specify Vehicle Name">
                <input
                  name="vehicleTypesOther"
                  value={form.vehicleTypesOther || ''}
                  onChange={handleChange}
                  placeholder="e.g. Bull Cart"
                  className={`${inputCls} border-orange-400 font-semibold text-orange-700 shadow-[0_0_15px_rgba(251,146,60,0.1)]`}
                />
              </Field>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
});

export const LandSection = React.memo(({ form, handleChange, isReadOnly, inputCls, selectCls, setForm }) => {
  return (
    <SectionCard
      icon={Tractor}
      title="Land & Farming Details"
      color="green"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        <div className="sm:col-span-1 lg:col-span-1">
          <Field label="Total Land Area" required>
            <div className="flex items-center gap-2">
              <input
                name="totalLand"
                value={form.totalLand}
                onChange={handleChange}
                type="number"
                min="0"
                placeholder="0"
                className={`${inputCls} w-24`}
              />
              <select
                name="landUnit"
                value={form.landUnit}
                onChange={handleChange}
                className={`${selectCls} w-24`}
              >
                <option value="Acre">Acre</option>
                <option value="Bigha">Bigha</option>
              </select>
            </div>
          </Field>
        </div>
        <div>
          <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mb-1.5">Ownership</label>
          <div className="flex gap-4">
            <RadioItem name="landOwnership" value="Personal Land" label="Personal" checked={form.landOwnership === 'Personal Land'} onChange={(name, val) => handleChange({ target: { name, value: val } })} />
            <RadioItem name="landOwnership" value="Family Land" label="Family" checked={form.landOwnership === 'Family Land'} onChange={(name, val) => handleChange({ target: { name, value: val } })} />
          </div>
        </div>
        <div>
          <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mb-1.5">Land Type</label>
          <div className="flex gap-4">
            <RadioItem name="landType" value="Irrigated" label="Irrigated" checked={form.landType === 'Irrigated'} onChange={(name, val) => handleChange({ target: { name, value: val } })} />
            <RadioItem name="landType" value="Non Irrigated" label="Non Irrigated" checked={form.landType === 'Non Irrigated'} onChange={(name, val) => handleChange({ target: { name, value: val } })} />
          </div>
        </div>
        <div>
          <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mb-1.5">Irrigation Source</label>
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            {['Tube Well', 'Canal', 'Rain Based', 'Well', 'Other'].map(s => (
              <RadioItem key={s} name="irrigationSource" value={s} label={s} checked={form.irrigationSource === s} onChange={(name, val) => handleChange({ target: { name, value: val } })} />
            ))}
          </div>
          {form.irrigationSource === 'Other' && (
            <div className="animate-fade-in">
              <Field label="Specify Source">
                <input
                  name="irrigationSourceOther"
                  value={form.irrigationSourceOther || ''}
                  onChange={handleChange}
                  placeholder="e.g. River"
                  className={`${inputCls} border-orange-400 font-semibold text-orange-700 shadow-[0_0_15px_rgba(251,146,60,0.1)]`}
                />
              </Field>
            </div>
          )}
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Users size={14} strokeWidth={1.5} className="text-emerald-500" /> Livestock Details
          </label>
          <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
            {['Cow', 'Buffalo', 'Goat', 'Other'].map(l => {
              const isSelected = form.livestock?.some(ls => ls.name === l);
              const currentItem = form.livestock?.find(ls => ls.name === l);

              return (
                <div key={l} className="flex flex-col gap-1.5 min-w-[110px]">
                  <div className="flex items-center gap-1.5 group">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const list = form.livestock ? [...form.livestock] : [];
                          if (checked) {
                            handleChange({ target: { name: 'livestock', value: [...list, { name: l, count: '0' }] } });
                          } else {
                            const updated = list.filter(ls => ls.name !== l);
                            if (l === 'Other') {
                              handleChange({ target: { name: 'livestock', value: updated } });
                              handleChange({ target: { name: 'livestockOther', value: '' } });
                              handleChange({ target: { name: 'livestockOtherCount', value: '' } });
                            } else {
                              handleChange({ target: { name: 'livestock', value: updated } });
                            }
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 transition-all cursor-pointer"
                      />
                      <span className={`text-xs font-semibold transition-all ${isSelected ? 'text-slate-900 border-b-2 border-slate-900/10' : 'text-slate-600 group-hover:text-slate-900'}`}>{l}</span>
                    </label>

                    {isSelected && (
                      <div className="flex items-center animate-fade-in text-[10px] sm:text-xs text-slate-400 font-normal">
                        (
                        <input
                          type="number"
                          min="1"
                          value={l === 'Other' ? form.livestockOtherCount : (currentItem?.count || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (l === 'Other') {
                              handleChange({ target: { name: 'livestockOtherCount', value: val } });
                            } else {
                              const updated = form.livestock.map(ls => ls.name === l ? { ...ls, count: val } : ls);
                              handleChange({ target: { name: 'livestock', value: updated } });
                            }
                          }}
                          placeholder="0"
                          className="w-8 sm:w-10 px-1 py-0 bg-transparent text-center border-b border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-slate-500 placeholder:text-slate-200 text-xs sm:text-sm"
                        />
                        )
                      </div>
                    )}
                  </div>

                  {isSelected && l === 'Other' && (
                    <div className="animate-fade-in ml-1 mt-0.5">
                      <input
                        value={form.livestockOther || ''}
                        onChange={(e) => handleChange({ target: { name: 'livestockOther', value: e.target.value } })}
                        placeholder="Specify Name"
                        className="w-full px-1.5 py-1 sm:py-2 rounded-md border border-orange-100 bg-white text-[9px] sm:text-xs font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400/30 shadow-sm"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionCard>
  );
});

export const PhotosSection = React.memo(({ form, handlePhotoUpload, removePhoto, getPhotoPreview, isReadOnly }) => {
  return (
    <SectionCard
      icon={Camera}
      title="Photo Documentation"
      color="violet"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
        <PhotoUpload studentId={form.studentId} id="photo1" label="1. Passport size photo" onUpload={(url) => handlePhotoUpload("1. Passport size photo", url)} previewUrl={getPhotoPreview("1. Passport size photo")} />
        <PhotoUpload studentId={form.studentId} id="photo2" label="2. Photo with supervisor" onUpload={(url) => handlePhotoUpload("2. Photo with supervisor", url)} previewUrl={getPhotoPreview("2. Photo with supervisor")} />
        <PhotoUpload studentId={form.studentId} id="photo3" label="3. Photo with family" onUpload={(url) => handlePhotoUpload("3. Photo with family", url)} previewUrl={getPhotoPreview("3. Photo with family")} />
        <PhotoUpload
          studentId={form.studentId}
          id="photo4"
          label="4. Photo of House"
          required={true}
          isMissing={!getPhotoPreview("4. Photo of House")}
          onUpload={(url) => handlePhotoUpload("4. Photo of House", url)}
          previewUrl={getPhotoPreview("4. Photo of House")}
        />
        <PhotoUpload studentId={form.studentId} id="photo-add-more" label="Other photos" onUpload={(url) => handlePhotoUpload("Other photos", url)} previewUrl={null} />
      </div>

      {(form.photos || []).filter(p => p.label.includes("Other")).length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1 block mb-2">Uploaded Other Photos</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {(form.photos || []).filter(p => p.label.includes("Other")).map((p, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50">
                <img src={p.url} alt="Other document" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(p.url)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 active:scale-95"
                  title="Delete Photo"
                >
                  <Trash2 size={10} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
});

export const DeclarationSection = React.memo(({ form, handleChange, isReadOnly }) => {
  return (
    <SectionCard
      icon={FileText}
      title="Declaration"
      color="slate"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-4">
        "I hereby declare that the information provided above is true and correct to the best of my knowledge. If any information is found incorrect or false, the scholarship may be cancelled."
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SignatureField studentId={form.studentId} label="Student Signature" onUpload={url => handleChange({ target: { name: 'studentSignatureUrl', value: url } })} previewUrl={form.studentSignatureUrl} />
        <SignatureField studentId={form.studentId} label="Father Signature" onUpload={url => handleChange({ target: { name: 'fatherSignatureUrl', value: url } })} previewUrl={form.fatherSignatureUrl} />
        <SignatureField studentId={form.studentId} label="Mother Signature" onUpload={url => handleChange({ target: { name: 'motherSignatureUrl', value: url } })} previewUrl={form.motherSignatureUrl} />
        <SignatureField studentId={form.studentId} label="Supervisor Signature" onUpload={url => handleChange({ target: { name: 'supervisorSignatureUrl', value: url } })} previewUrl={form.supervisorSignatureUrl} />
      </div>
    </SectionCard>
  );
});

export const RemarksSection = React.memo(({ form, handleChange, isReadOnly, inputCls, textareaCls }) => {
  return (
    <SectionCard
      icon={AlertCircle}
      title="Evaluation & Remarks"
      color="sky"
      open={true}
      onToggle={() => { }}
      locked={isReadOnly}
    >
      <div className="grid grid-cols-1 gap-5">
        <Field label="Home Visit Marks (Max 50)">
          <div className="flex items-center gap-3">
            <input
              name="homeVisitMarks"
              value={form.homeVisitMarks}
              onChange={handleChange}
              type="number"
              min="0"
              max="50"
              placeholder="0"
              className={`${inputCls} max-w-[80px] sm:max-w-[100px] font-bold text-brand-600 text-sm sm:text-base`}
            />
            <span className="text-xs sm:text-sm font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">/ 50 Points</span>
          </div>
        </Field>

        <Field label="Supervisor Remarks">
          <textarea name="supervisorRemarks" value={form.supervisorRemarks} onChange={handleChange}
            rows={4} placeholder="e.g. Home verification accepted. Family conditions verified..." className={textareaCls} />
        </Field>
      </div>
    </SectionCard>
  );
});
