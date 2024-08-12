import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Typography from '@mui/material/Typography';
import { CardActionArea, Grid } from '@mui/material';


type details = {
    label: string,
    onClick: ()=>void,
    icon: any,
    color:string,
    disabled:boolean
  }
export const  OptionCard:React.FC<{details:details}>=({details})=> {
  return (
    <Grid item xs={8}>
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea className='text-center p-2'  onClick={details.onClick} disabled={details?.disabled}>
        <details.icon  color={details?.color} style={{fontSize:"30px"}}/>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {details.label}
          </Typography>

        </CardContent>
      </CardActionArea>
    </Card>
    </Grid>
  );
}
