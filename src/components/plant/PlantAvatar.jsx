import React, { useEffect, useState } from 'react';
import './PlantAvatar.css';

// Dynamic LED position based on growth stage
const GROW_LIGHT_OFFSET = {
  seed: 50,
  sprout: -45,
  plant: -75,
  mature: -85,
  dead: null, // hidden
};

const PlantAvatar = ({ species = 'cay_kim_tien', stage = 'seed', isWatering = false, potSkin = null, isBlooming = false, hasGrowLight = false }) => {
  const [prevStage, setPrevStage] = useState(stage);
  const [isGrowing, setIsGrowing] = useState(false);

  useEffect(() => {
    if (stage !== prevStage) {
      setIsGrowing(true);
      setPrevStage(stage);
      const timer = setTimeout(() => setIsGrowing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [stage, prevStage]);

  const potClass = potSkin === 'gold_pot' ? 'gold-pot-skin' 
    : potSkin === 'bat_trang_pot' ? 'bat-trang-pot-skin' 
    : potSkin === 'marble_pot' ? 'marble-pot-skin' 
    : '';

  const isDead = stage === 'dead';
  const growLightTop = GROW_LIGHT_OFFSET[stage] ?? -15;

  return (
    <div className={`plant-container ${species} ${stage} ${potClass} ${isDead ? 'is-dead' : ''}`}>
      {/* Grow Light LED Effect — hidden when dead */}
      {hasGrowLight && !isDead && (
        <div 
          className="grow-light" 
          style={{ 
            top: `${growLightTop}px`,
            transform: 'translateX(-50%)',
            transformOrigin: 'top center'
          }}
        >
          <div className="grow-light-lamp"></div>
          <div className="grow-light-beam"></div>
        </div>
      )}

      {/* Watering Effect */}
      {isWatering && !isDead && (
        <div className="water-droplets">
          <div className="drop d1"></div>
          <div className="drop d2"></div>
          <div className="drop d3"></div>
          <div className="drop d4"></div>
        </div>
      )}

      {/* The Pot and Soil */}
      <div className="pot-back"></div>
      <div className="soil"></div>
      
      {/* The Plant Itself */}
      <div className={`plant-wrapper ${isGrowing ? 'growing' : ''}`}>
        {/* ===== DEAD STATE ===== */}
        {isDead && (
          <div className="dead-plant">
            <div className="dead-stem"></div>
            <div className="dead-leaf dl1"></div>
            <div className="dead-leaf dl2"></div>
            <div className="dead-leaf dl3"></div>
          </div>
        )}

        {stage === 'seed' && (
          <div className="seed-asset"></div>
        )}

        {stage === 'sprout' && (
          <div className="sprout-stem">
            <div className="sprout-leaf left"></div>
            <div className="sprout-leaf right"></div>
          </div>
        )}

        {(stage === 'plant' || stage === 'mature') && (
          <div className="plant-body">
            {species === 'sen_da_hong_sao' && (
              <div className="succulent">
                <div className="petal p1"></div>
                <div className="petal p2"></div>
                <div className="petal p3"></div>
                <div className="petal p4"></div>
                <div className="petal p5"></div>
                <div className="petal p6"></div>
                <div className="petal center"></div>
                {stage === 'mature' && <div className="flower-star">⭐</div>}
              </div>
            )}
            
            {species === 'cay_kim_tien' && (
              <div className="zz-plant">
                <div className="stem s1">
                  <div className="leaf l1"></div>
                  <div className="leaf l2"></div>
                  <div className="leaf l3"></div>
                  <div className="leaf l4"></div>
                </div>
                <div className="stem s2">
                  <div className="leaf l1"></div>
                  <div className="leaf l2"></div>
                  <div className="leaf l3"></div>
                  <div className="leaf l4"></div>
                </div>
                {stage === 'mature' && (
                   <div className="stem s3">
                     <div className="leaf l1"></div>
                     <div className="leaf l2"></div>
                   </div>
                )}
              </div>
            )}

            {species === 'cay_luoi_ho' && (
              <div className="snake-plant">
                <div className="blade b1"></div>
                <div className="blade b2"></div>
                <div className="blade b3"></div>
                {stage === 'mature' && <div className="blade b4"></div>}
                {stage === 'mature' && <div className="blade b5"></div>}
              </div>
            )}

            {species === 'cay_phat_tai' && (
              <div className="bamboo">
                <div className="bamboo-stalk bs1">
                  <div className="bamboo-leaf"></div>
                  <div className="bamboo-leaf"></div>
                </div>
                <div className="bamboo-stalk bs2">
                  <div className="bamboo-leaf"></div>
                  <div className="bamboo-leaf"></div>
                </div>
                {stage === 'mature' && (
                  <div className="bamboo-stalk bs3">
                    <div className="bamboo-leaf"></div>
                  </div>
                )}
                <div className="bamboo-ribbon"></div>
              </div>
            )}

            {species === 'sen_da_do_la' && (
              <div className="dola">
                <div className="dola-stem ds-main">
                  <div className="dola-leaf dl1"></div>
                  <div className="dola-leaf dl2"></div>
                  <div className="dola-leaf dl3"></div>
                  <div className="dola-leaf dl4"></div>
                </div>
                <div className="dola-stem ds-branch1">
                  <div className="dola-leaf dl1"></div>
                  <div className="dola-leaf dl2"></div>
                </div>
                {stage === 'mature' && (
                  <div className="dola-stem ds-branch2">
                    <div className="dola-leaf dl1"></div>
                    <div className="dola-leaf dl2"></div>
                  </div>
                )}
              </div>
            )}

            {species === 'cay_van_loc' && (
              <div className="vanloc">
                <div className="vl-leaf vl1"></div>
                <div className="vl-leaf vl2"></div>
                <div className="vl-leaf vl3"></div>
                {stage === 'mature' && (
                  <>
                    <div className="vl-leaf vl4"></div>
                    <div className="vl-leaf vl5"></div>
                  </>
                )}
              </div>
            )}

            {/* ===== ORIGINAL NEW SPECIES ===== */}

            {/* Cây Trầu Bà Đế Vương (Imperial Philodendron) */}
            {species === 'cay_trau_ba' && (
              <div className="trau-ba">
                <div className="tb-stem"></div>
                <div className="tb-leaf tbl1"></div>
                <div className="tb-leaf tbl2"></div>
                <div className="tb-leaf tbl3"></div>
                {stage === 'mature' && (
                  <>
                    <div className="tb-leaf tbl4"></div>
                    <div className="tb-leaf tbl5"></div>
                  </>
                )}
              </div>
            )}

            {/* Cây Thiết Mộc Lan (Money Tree / Dracaena) */}
            {species === 'cay_thiet_moc_lan' && (
              <div className="thiet-moc-lan">
                <div className="tml-trunk"></div>
                <div className="tml-leaf tmll1"></div>
                <div className="tml-leaf tmll2"></div>
                <div className="tml-leaf tmll3"></div>
                <div className="tml-leaf tmll4"></div>
                {stage === 'mature' && (
                  <>
                    <div className="tml-leaf tmll5"></div>
                    <div className="tml-leaf tmll6"></div>
                  </>
                )}
              </div>
            )}

            {/* Cây Hoa Quỳnh (Night-blooming Cereus) */}
            {species === 'cay_hoa_quynh' && (
              <div className={`hoa-quynh ${isBlooming ? 'blooming' : ''}`}>
                <div className="hq-pad hq1"></div>
                <div className="hq-pad hq2"></div>
                <div className="hq-pad hq3"></div>
                {stage === 'mature' && <div className="hq-pad hq4"></div>}
                {isBlooming && (
                  <div className="hq-flower">
                    <div className="hq-petal hqp1"></div>
                    <div className="hq-petal hqp2"></div>
                    <div className="hq-petal hqp3"></div>
                    <div className="hq-petal hqp4"></div>
                    <div className="hq-petal hqp5"></div>
                    <div className="hq-center"></div>
                  </div>
                )}
              </div>
            )}

            {/* ===== 12 NEW VIETNAMESE SPECIES ===== */}

            {/* Tùng Bồng Lai — dense green cloud shapes */}
            {species === 'tung_bong_lai' && (
              <div className="tung-bong-lai">
                <div className="tbl-trunk"></div>
                <div className="tbl-cloud tc1"></div>
                <div className="tbl-cloud tc2"></div>
                <div className="tbl-cloud tc3"></div>
                {stage === 'mature' && <div className="tbl-cloud tc4"></div>}
              </div>
            )}

            {/* Hạnh Phúc Mini — bushy bright-light lover */}
            {species === 'hanh_phuc_mini' && (
              <div className="hanh-phuc">
                <div className="hp-stem"></div>
                <div className="hp-leaf hpl1"></div>
                <div className="hp-leaf hpl2"></div>
                <div className="hp-leaf hpl3"></div>
                <div className="hp-leaf hpl4"></div>
                {stage === 'mature' && (
                  <>
                    <div className="hp-leaf hpl5"></div>
                    <div className="hp-leaf hpl6"></div>
                  </>
                )}
              </div>
            )}

            {/* Kim Ngân Lượng — red berry circles */}
            {species === 'kim_ngan_luong' && (
              <div className="kim-ngan">
                <div className="kn-trunk"></div>
                <div className="kn-leaf knl1"></div>
                <div className="kn-leaf knl2"></div>
                <div className="kn-leaf knl3"></div>
                <div className="kn-berry kb1"></div>
                <div className="kn-berry kb2"></div>
                {stage === 'mature' && (
                  <>
                    <div className="kn-leaf knl4"></div>
                    <div className="kn-berry kb3"></div>
                    <div className="kn-berry kb4"></div>
                  </>
                )}
              </div>
            )}

            {/* Đuôi Công — striped oval leaves with purple */}
            {species === 'duoi_cong' && (
              <div className="duoi-cong">
                <div className="dc-leaf dcl1"></div>
                <div className="dc-leaf dcl2"></div>
                <div className="dc-leaf dcl3"></div>
                {stage === 'mature' && (
                  <>
                    <div className="dc-leaf dcl4"></div>
                    <div className="dc-leaf dcl5"></div>
                  </>
                )}
              </div>
            )}

            {/* Bàng Singapore Mini — broad dark green leaves */}
            {species === 'bang_singapore' && (
              <div className="bang-sg">
                <div className="bs-trunk"></div>
                <div className="bs-leaf bsl1"></div>
                <div className="bs-leaf bsl2"></div>
                <div className="bs-leaf bsl3"></div>
                {stage === 'mature' && (
                  <>
                    <div className="bs-leaf bsl4"></div>
                    <div className="bs-leaf bsl5"></div>
                  </>
                )}
              </div>
            )}

            {/* Hương Thảo (Rosemary) — needle-like leaves */}
            {species === 'huong_thao' && (
              <div className="huong-thao">
                <div className="ht-stem ht-s1">
                  <div className="ht-needle htn1"></div>
                  <div className="ht-needle htn2"></div>
                  <div className="ht-needle htn3"></div>
                  <div className="ht-needle htn4"></div>
                </div>
                <div className="ht-stem ht-s2">
                  <div className="ht-needle htn1"></div>
                  <div className="ht-needle htn2"></div>
                  <div className="ht-needle htn3"></div>
                </div>
                {stage === 'mature' && (
                  <div className="ht-stem ht-s3">
                    <div className="ht-needle htn1"></div>
                    <div className="ht-needle htn2"></div>
                  </div>
                )}
              </div>
            )}

            {/* Dây Nhện — cascading thin striped leaves */}
            {species === 'day_nhen' && (
              <div className="day-nhen">
                <div className="dn-leaf dnl1"></div>
                <div className="dn-leaf dnl2"></div>
                <div className="dn-leaf dnl3"></div>
                <div className="dn-leaf dnl4"></div>
                <div className="dn-leaf dnl5"></div>
                {stage === 'mature' && (
                  <>
                    <div className="dn-leaf dnl6"></div>
                    <div className="dn-leaf dnl7"></div>
                    <div className="dn-runner dnr1">
                      <div className="dn-baby"></div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Trúc Phát Tài — segmented stalks */}
            {species === 'truc_phat_tai' && (
              <div className="truc-pt">
                <div className="tp-stalk tps1"></div>
                <div className="tp-stalk tps2"></div>
                <div className="tp-top-leaf tptl1"></div>
                <div className="tp-top-leaf tptl2"></div>
                {stage === 'mature' && (
                  <>
                    <div className="tp-stalk tps3"></div>
                    <div className="tp-top-leaf tptl3"></div>
                  </>
                )}
              </div>
            )}

            {/* Ngũ Gia Bì Mini — palmate leaf clusters */}
            {species === 'ngu_gia_bi' && (
              <div className="ngu-gia-bi">
                <div className="ngb-stem"></div>
                <div className="ngb-cluster ngbc1">
                  <div className="ngb-finger f1"></div>
                  <div className="ngb-finger f2"></div>
                  <div className="ngb-finger f3"></div>
                  <div className="ngb-finger f4"></div>
                  <div className="ngb-finger f5"></div>
                </div>
                {stage === 'mature' && (
                  <div className="ngb-cluster ngbc2">
                    <div className="ngb-finger f1"></div>
                    <div className="ngb-finger f2"></div>
                    <div className="ngb-finger f3"></div>
                    <div className="ngb-finger f4"></div>
                    <div className="ngb-finger f5"></div>
                  </div>
                )}
              </div>
            )}

            {/* Vạn Lộc (Lá Sọc) — pink and green variegated */}
            {species === 'van_loc_new' && (
              <div className="van-loc-new">
                <div className="vln-leaf vlnl1"></div>
                <div className="vln-leaf vlnl2"></div>
                <div className="vln-leaf vlnl3"></div>
                {stage === 'mature' && (
                  <>
                    <div className="vln-leaf vlnl4"></div>
                    <div className="vln-leaf vlnl5"></div>
                  </>
                )}
              </div>
            )}

            {/* Thường Xuân (Ivy) — trailing vines */}
            {species === 'thuong_xuan' && (
              <div className="thuong-xuan">
                <div className="tx-vine txv1">
                  <div className="tx-ivy-leaf txil1"></div>
                  <div className="tx-ivy-leaf txil2"></div>
                  <div className="tx-ivy-leaf txil3"></div>
                </div>
                <div className="tx-vine txv2">
                  <div className="tx-ivy-leaf txil1"></div>
                  <div className="tx-ivy-leaf txil2"></div>
                </div>
                {stage === 'mature' && (
                  <div className="tx-vine txv3">
                    <div className="tx-ivy-leaf txil1"></div>
                    <div className="tx-ivy-leaf txil2"></div>
                    <div className="tx-ivy-leaf txil3"></div>
                  </div>
                )}
              </div>
            )}

            {/* Nhất Mạt Hương — scalloped leaves */}
            {species === 'nhat_mat_huong' && (
              <div className="nhat-mat-huong">
                <div className="nmh-stem"></div>
                <div className="nmh-leaf nmhl1"></div>
                <div className="nmh-leaf nmhl2"></div>
                <div className="nmh-leaf nmhl3"></div>
                {stage === 'mature' && (
                  <>
                    <div className="nmh-leaf nmhl4"></div>
                    <div className="nmh-leaf nmhl5"></div>
                  </>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      <div className="pot-front"></div>
    </div>
  );
};

export default PlantAvatar;
