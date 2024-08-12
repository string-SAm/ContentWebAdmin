"use client";
import { Backdrop } from '@mui/material'
import React, { useEffect, useState } from 'react'
import styles from './style.module.css';
const LockedScreen = () => {

    const backgroundImageUrl = 'https://images.pexels.com/photos/3375493/pexels-photo-3375493.jpeg?cs=srgb&dl=photo-of-birds-flying-during-daytime-3375493.jpg&fm=jpg';

    return (
        <div>
            <div className={styles.background} style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
                <div className={styles.centeredText}>Currently You are Locked until the changes are finalised</div>
            </div>
            <Backdrop
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={true}
                onClick={() => null}
            ></Backdrop>
        </div>
    )
}

export default LockedScreen