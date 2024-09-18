import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Layout from '../components/Layout';
import CreateScheduleEntry from '../components/CreateScheduleEntry';

function Schedule() {
	return (
		<Layout>
			<CreateScheduleEntry />
		</Layout>
	);
}

export default Schedule;
